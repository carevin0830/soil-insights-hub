-- Update RLS policies to allow all authenticated users to update and delete soil_data
DROP POLICY IF EXISTS "Experts can update soil data" ON soil_data;
DROP POLICY IF EXISTS "Experts can delete soil data" ON soil_data;

-- Allow all authenticated users to update soil data
CREATE POLICY "Authenticated users can update soil data"
ON soil_data
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to delete soil data
CREATE POLICY "Authenticated users can delete soil data"
ON soil_data
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);