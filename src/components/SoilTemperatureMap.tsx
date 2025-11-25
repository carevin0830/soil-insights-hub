import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';
import { Card } from './ui/card';

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

// Component to fit bounds when data loads
function MapBounds({ points }: { points: SoilDataPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map(point => {
        const coords = point.location.coordinates;
        return [coords[1], coords[0]] as [number, number];
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function SoilTemperatureMap() {
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSoilData();
  }, []);

  const fetchSoilData = async () => {
    try {
      const { data, error } = await supabase
        .from('soil_data')
        .select('id, location, temperature, ph, fertility_percentage, location_name, collected_at, temp_category')
        .order('collected_at', { ascending: false });

      if (error) throw error;
      setSoilData(data || []);
    } catch (error) {
      console.error('Error fetching soil data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get color based on temperature
  const getTemperatureColor = (temp: number): string => {
    if (temp < 15) return '#4A90E2'; // Cold - Blue
    if (temp < 20) return '#50C878'; // Cool - Green
    if (temp < 25) return '#F4D03F'; // Ideal - Yellow
    if (temp < 30) return '#F39C12'; // Warm - Orange
    return '#E74C3C'; // Hot - Red
  };

  // Get radius based on temperature intensity
  const getRadius = (temp: number): number => {
    return Math.max(8, Math.min(20, temp * 0.5));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </Card>
    );
  }

  if (soilData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">No soil data available yet</p>
        </div>
      </Card>
    );
  }

  // Default center (Abra, Philippines region)
  const defaultCenter: [number, number] = [17.5969, 120.8472];

  return (
    <Card className="overflow-hidden">
      <div className="h-[500px] w-full">
        <MapContainer
          center={defaultCenter}
          zoom={11}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds points={soilData} />

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
      
      {/* Legend */}
      <div className="p-4 bg-muted/30 border-t">
        <h4 className="text-sm font-semibold mb-2">Temperature Legend</h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4A90E2' }}></div>
            <span>&lt;15°C Cold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#50C878' }}></div>
            <span>15-20°C Cool</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F4D03F' }}></div>
            <span>20-25°C Ideal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F39C12' }}></div>
            <span>25-30°C Warm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#E74C3C' }}></div>
            <span>&gt;30°C Hot</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
