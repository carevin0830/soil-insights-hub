-- Insert sample soil data for the three municipalities

INSERT INTO soil_data (
  municipality_id,
  location,
  location_name,
  temperature,
  ph,
  fertility_percentage,
  nitrogen_level,
  phosphorus_level,
  potassium_level,
  collected_at
) VALUES
  -- Sallapadan Municipality (various temperatures from cool to hot)
  ('5ceb1a70-dcb6-4b76-8244-b31b9688e749', ST_SetSRID(ST_MakePoint(120.86, 17.54), 4326), 'Sallapadan Central Farm', 24.5, 6.5, 78.5, 45.2, 38.5, 52.1, NOW() - INTERVAL '2 days'),
  ('5ceb1a70-dcb6-4b76-8244-b31b9688e749', ST_SetSRID(ST_MakePoint(120.87, 17.55), 4326), 'Sallapadan East Field', 26.2, 6.2, 72.3, 42.8, 35.2, 48.9, NOW() - INTERVAL '3 days'),
  ('5ceb1a70-dcb6-4b76-8244-b31b9688e749', ST_SetSRID(ST_MakePoint(120.85, 17.53), 4326), 'Sallapadan West Valley', 23.8, 6.8, 82.1, 48.5, 41.2, 55.3, NOW() - INTERVAL '4 days'),
  ('5ceb1a70-dcb6-4b76-8244-b31b9688e749', ST_SetSRID(ST_MakePoint(120.88, 17.56), 4326), 'Sallapadan Highland Area', 21.5, 7.0, 85.6, 51.2, 43.8, 58.4, NOW() - INTERVAL '5 days'),
  ('5ceb1a70-dcb6-4b76-8244-b31b9688e749', ST_SetSRID(ST_MakePoint(120.84, 17.52), 4326), 'Sallapadan South Plot', 27.3, 5.9, 68.9, 39.5, 32.1, 45.6, NOW() - INTERVAL '6 days'),
  
  -- Bucay Municipality (diverse temperature readings)
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.75, 17.55), 4326), 'Bucay Rice Paddy North', 25.1, 6.4, 75.8, 44.1, 37.9, 50.2, NOW() - INTERVAL '1 day'),
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.76, 17.56), 4326), 'Bucay Central Farmland', 28.5, 6.1, 65.4, 38.2, 30.5, 42.8, NOW() - INTERVAL '2 days'),
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.74, 17.54), 4326), 'Bucay Riverside Plot', 22.7, 6.9, 80.3, 47.3, 40.1, 53.7, NOW() - INTERVAL '3 days'),
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.77, 17.57), 4326), 'Bucay Elevated Field', 20.8, 7.2, 87.2, 52.8, 44.9, 59.1, NOW() - INTERVAL '4 days'),
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.73, 17.53), 4326), 'Bucay South Valley', 26.9, 6.3, 71.5, 41.6, 34.8, 47.3, NOW() - INTERVAL '5 days'),
  ('a91f1f97-d0e3-4fa9-b70f-959b9de43df7', ST_SetSRID(ST_MakePoint(120.78, 17.58), 4326), 'Bucay Mountain Base', 19.4, 7.3, 89.1, 54.2, 46.5, 61.3, NOW() - INTERVAL '6 days'),
  
  -- Lagangilang Municipality (full temperature range)
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.91, 17.63), 4326), 'Lagangilang Main Field', 23.6, 6.7, 79.4, 46.8, 39.6, 52.9, NOW() - INTERVAL '1 day'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.92, 17.64), 4326), 'Lagangilang East Farm', 25.8, 6.5, 74.2, 43.5, 36.8, 49.7, NOW() - INTERVAL '2 days'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.90, 17.62), 4326), 'Lagangilang West Plot', 22.1, 6.9, 83.7, 49.7, 42.3, 56.8, NOW() - INTERVAL '3 days'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.93, 17.65), 4326), 'Lagangilang Highland', 18.9, 7.4, 91.3, 55.8, 48.2, 63.5, NOW() - INTERVAL '4 days'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.89, 17.61), 4326), 'Lagangilang Valley Bottom', 27.8, 6.0, 67.6, 37.9, 31.2, 44.1, NOW() - INTERVAL '5 days'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.94, 17.66), 4326), 'Lagangilang North Ridge', 17.5, 7.5, 93.5, 57.3, 49.8, 65.2, NOW() - INTERVAL '6 days'),
  ('db0c53be-8ea8-45e7-baed-6bf68bc3fbda', ST_SetSRID(ST_MakePoint(120.88, 17.60), 4326), 'Lagangilang South Field', 29.2, 5.8, 63.8, 36.1, 28.9, 41.5, NOW() - INTERVAL '7 days');