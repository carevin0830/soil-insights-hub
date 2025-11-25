-- Fix security linter issues

-- 1. Fix function search paths for categorization functions
CREATE OR REPLACE FUNCTION categorize_ph(ph_value DECIMAL)
RETURNS soil_ph_category
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION categorize_temperature(temp DECIMAL)
RETURNS soil_temp_category
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION categorize_fertility(fertility DECIMAL)
RETURNS soil_fertility_category
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION auto_categorize_soil_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ph_category := categorize_ph(NEW.ph);
  NEW.temp_category := categorize_temperature(NEW.temperature);
  NEW.fertility_category := categorize_fertility(NEW.fertility_percentage);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;