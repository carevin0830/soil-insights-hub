import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

interface SoilDataPoint {
  id: string;
  location: any;
  temperature: number;
  ph: number;
  fertility_percentage: number | null;
  location_name: string | null;
  collected_at: string | null;
  temp_category: string | null;
}

interface SoilMapProps {
  soilData: SoilDataPoint[];
}

// Get color based on temperature
const getTemperatureColor = (temp: number): string => {
  if (temp < 15) return '#4A90E2';
  if (temp < 20) return '#50C878';
  if (temp < 25) return '#F4D03F';
  if (temp < 30) return '#F39C12';
  return '#E74C3C';
};

// Get radius based on temperature
const getRadius = (temp: number): number => {
  return Math.max(8, Math.min(20, temp * 0.5));
};

function SoilMap({ soilData }: SoilMapProps) {
  const mapCenter = useMemo<[number, number]>(() => {
    if (soilData.length === 0) return [17.5969, 120.8472];
    
    const avgLat = soilData.reduce((sum, point) => {
      const coords = point.location as { coordinates: [number, number] };
      return sum + coords.coordinates[1];
    }, 0) / soilData.length;
    
    const avgLng = soilData.reduce((sum, point) => {
      const coords = point.location as { coordinates: [number, number] };
      return sum + coords.coordinates[0];
    }, 0) / soilData.length;
    
    return [avgLat, avgLng];
  }, [soilData]);

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {soilData.map((point) => {
          const coords = point.location.coordinates;
          const position: [number, number] = [coords[1], coords[0]];

          return (
            <CircleMarker
              key={point.id}
              center={position}
              radius={getRadius(point.temperature)}
              pathOptions={{
                fillColor: getTemperatureColor(point.temperature),
                fillOpacity: 0.7,
                color: getTemperatureColor(point.temperature),
                weight: 2,
                opacity: 0.9
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold mb-2">
                    {point.location_name || 'Soil Sample'}
                  </h3>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Temperature:</span>{' '}
                      <span style={{ color: getTemperatureColor(point.temperature) }}>
                        {point.temperature.toFixed(1)}°C
                      </span>
                      {point.temp_category && (
                        <span className="text-xs ml-1">({point.temp_category})</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">pH:</span> {point.ph.toFixed(2)}
                    </p>
                    {point.fertility_percentage !== null && (
                      <p>
                        <span className="font-medium">Fertility:</span>{' '}
                        {point.fertility_percentage.toFixed(1)}%
                      </p>
                    )}
                    {point.collected_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(point.collected_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default SoilMap;
