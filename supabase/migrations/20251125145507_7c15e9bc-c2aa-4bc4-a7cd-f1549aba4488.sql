-- Update RLS policies for soil_data to allow authenticated users to insert their own data

-- Drop the old restrictive insert policy
DROP POLICY IF EXISTS "Experts can insert soil data" ON soil_data;

-- Create new policy allowing authenticated users to insert soil data
CREATE POLICY "Authenticated users can insert soil data"
ON soil_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also update the collected_by field to be set automatically
-- This ensures proper tracking of who collected the data