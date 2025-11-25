-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE app_role AS ENUM ('farmer', 'expert', 'researcher');

CREATE TYPE soil_ph_category AS ENUM (
  'optimal',
  'slightly_acidic',
  'slightly_alkaline',
  'moderately_acidic',
  'moderately_alkaline',
  'strongly_acidic',
  'strongly_alkaline',
  'extremely_acidic',
  'extremely_alkaline'
);

CREATE TYPE soil_temp_category AS ENUM (
  'ideal',
  'good',
  'warm',
  'hot',
  'stressful'
);

CREATE TYPE soil_fertility_category AS ENUM (
  'very_high',
  'high',
  'moderate',
  'low',
  'very_low'
);

-- Create municipalities table
CREATE TABLE public.municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  boundary GEOMETRY(Polygon, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the three municipalities
INSERT INTO public.municipalities (name) VALUES 
  ('Sallapadan'),
  ('Bucay'),
  ('Lagangilang');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create soil_data table
CREATE TABLE public.soil_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  location_name TEXT,
  
  -- Soil parameters
  ph DECIMAL(4,2) NOT NULL CHECK (ph >= 0 AND ph <= 14),
  temperature DECIMAL(5,2) NOT NULL,
  nitrogen_level DECIMAL(5,2),
  phosphorus_level DECIMAL(5,2),
  potassium_level DECIMAL(5,2),
  fertility_percentage DECIMAL(5,2) CHECK (fertility_percentage >= 0 AND fertility_percentage <= 100),
  
  -- Computed categories
  ph_category soil_ph_category,
  temp_category soil_temp_category,
  fertility_category soil_fertility_category,
  
  -- Metadata
  collected_by UUID REFERENCES auth.users(id),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create spatial index
CREATE INDEX soil_data_location_idx ON public.soil_data USING GIST(location);
CREATE INDEX soil_data_municipality_idx ON public.soil_data(municipality_id);

-- Function to categorize pH
CREATE OR REPLACE FUNCTION categorize_ph(ph_value DECIMAL)
RETURNS soil_ph_category
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF ph_value >= 6.5 AND ph_value <= 7.5 THEN
    RETURN 'optimal';
  ELSIF ph_value >= 6.0 AND ph_value < 6.5 THEN
    RETURN 'slightly_acidic';
  ELSIF ph_value > 7.5 AND ph_value <= 8.0 THEN
    RETURN 'slightly_alkaline';
  ELSIF ph_value >= 5.5 AND ph_value < 6.0 THEN
    RETURN 'moderately_acidic';
  ELSIF ph_value > 8.0 AND ph_value <= 8.5 THEN
    RETURN 'moderately_alkaline';
  ELSIF ph_value >= 5.0 AND ph_value < 5.5 THEN
    RETURN 'strongly_acidic';
  ELSIF ph_value > 8.5 AND ph_value <= 9.0 THEN
    RETURN 'strongly_alkaline';
  ELSIF ph_value < 5.0 THEN
    RETURN 'extremely_acidic';
  ELSE
    RETURN 'extremely_alkaline';
  END IF;
END;
$$;

-- Function to categorize temperature
CREATE OR REPLACE FUNCTION categorize_temperature(temp DECIMAL)
RETURNS soil_temp_category
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF temp >= 20 AND temp <= 25 THEN
    RETURN 'ideal';
  ELSIF temp > 25 AND temp <= 30 THEN
    RETURN 'good';
  ELSIF temp > 30 AND temp <= 35 THEN
    RETURN 'warm';
  ELSIF temp > 35 AND temp <= 40 THEN
    RETURN 'hot';
  ELSE
    RETURN 'stressful';
  END IF;
END;
$$;

-- Function to categorize fertility
CREATE OR REPLACE FUNCTION categorize_fertility(fertility DECIMAL)
RETURNS soil_fertility_category
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF fertility >= 80 THEN
    RETURN 'very_high';
  ELSIF fertility >= 60 THEN
    RETURN 'high';
  ELSIF fertility >= 40 THEN
    RETURN 'moderate';
  ELSIF fertility >= 20 THEN
    RETURN 'low';
  ELSE
    RETURN 'very_low';
  END IF;
END;
$$;

-- Trigger to auto-categorize soil data
CREATE OR REPLACE FUNCTION auto_categorize_soil_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.ph_category := categorize_ph(NEW.ph);
  NEW.temp_category := categorize_temperature(NEW.temperature);
  NEW.fertility_category := categorize_fertility(NEW.fertility_percentage);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER soil_data_auto_categorize
BEFORE INSERT OR UPDATE ON public.soil_data
FOR EACH ROW
EXECUTE FUNCTION auto_categorize_soil_data();

-- Trigger to update profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Enable RLS
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for municipalities (public read)
CREATE POLICY "Municipalities are viewable by everyone"
ON public.municipalities FOR SELECT
USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Experts and researchers can view all roles"
ON public.user_roles FOR SELECT
USING (
  public.has_role(auth.uid(), 'expert') OR 
  public.has_role(auth.uid(), 'researcher')
);

CREATE POLICY "Experts can assign farmer roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'expert') AND role = 'farmer'
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Experts and researchers can view all profiles"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'expert') OR 
  public.has_role(auth.uid(), 'researcher')
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for soil_data
CREATE POLICY "Everyone can view soil data"
ON public.soil_data FOR SELECT
USING (true);

CREATE POLICY "Experts can insert soil data"
ON public.soil_data FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'expert') OR 
  public.has_role(auth.uid(), 'researcher')
);

CREATE POLICY "Experts can update soil data"
ON public.soil_data FOR UPDATE
USING (
  public.has_role(auth.uid(), 'expert') OR 
  public.has_role(auth.uid(), 'researcher')
);

CREATE POLICY "Experts can delete soil data"
ON public.soil_data FOR DELETE
USING (
  public.has_role(auth.uid(), 'expert') OR 
  public.has_role(auth.uid(), 'researcher')
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default farmer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'farmer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();