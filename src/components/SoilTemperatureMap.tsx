import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface SoilDataPoint {
  id: string;
  location: any;
  temperature: number;
  ph: number;
  fertility_percentage: number | null;
  location_name: string | null;
  collected_at: string | null;
  temp_category: string | null;
  coordinates?: [number, number];
}

const getTemperatureColor = (temp: number): string => {
  if (temp < 15) return '#4A90E2';
  if (temp < 20) return '#50C878';
  if (temp < 25) return '#F4D03F';
  if (temp < 30) return '#F39C12';
  return '#E74C3C';
};

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
        .order('collected_at', { ascending: false});

      if (error) throw error;
      
      // Extract coordinates from PostGIS geometry
      const dataWithCoords = (data || []).map(point => {
        try {
          // PostGIS returns geometry as GeoJSON
          if (point.location && typeof point.location === 'object' && 'coordinates' in point.location) {
            const coords = (point.location as any).coordinates;
            if (coords && Array.isArray(coords) && coords.length === 2) {
              return {
                ...point,
                coordinates: [coords[1], coords[0]] as [number, number] // [lat, lng]
              };
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates for point:', point.id, e);
        }
        return point;
      });
      
      // Type guard to filter only points with coordinates
      const hasCoordinates = (point: any): point is SoilDataPoint & { coordinates: [number, number] } => {
        return point.coordinates !== undefined;
      };
      
      setSoilData(dataWithCoords.filter(hasCoordinates));
    } catch (error) {
      console.error('Error fetching soil data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">Loading soil data...</p>
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

  // Calculate map center from data points
  const getMapCenter = (): [number, number] => {
    if (soilData.length === 0) return [0, 0];
    
    const validPoints = soilData.filter((p): p is SoilDataPoint & { coordinates: [number, number] } => 
      p.coordinates !== undefined
    );
    
    if (validPoints.length === 0) return [0, 0];
    
    const avgLat = validPoints.reduce((sum, p) => sum + p.coordinates[0], 0) / validPoints.length;
    const avgLng = validPoints.reduce((sum, p) => sum + p.coordinates[1], 0) / validPoints.length;
    
    return [avgLat, avgLng];
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Interactive Map */}
        <div className="mb-6 h-[500px] rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={getMapCenter()}
            zoom={soilData.length > 0 ? 10 : 2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {soilData.map((point) => (
              point.coordinates && (
                <CircleMarker
                  key={point.id}
                  center={point.coordinates}
                  radius={10}
                  fillColor={getTemperatureColor(point.temperature)}
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold mb-2">
                        {point.location_name || 'Unknown Location'}
                      </h4>
                      <div className="space-y-1 text-sm">
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
                        {point.fertility_percentage && (
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
              )
            ))}
          </MapContainer>
        </div>
        
        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soilData.map((point) => (
            <div
              key={point.id}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${getTemperatureColor(point.temperature)}20` }}
                >
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: getTemperatureColor(point.temperature) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {point.location_name || 'Unknown Location'}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Temp:</span>{' '}
                      <span
                        className="font-semibold"
                        style={{ color: getTemperatureColor(point.temperature) }}
                      >
                        {point.temperature.toFixed(1)}°C
                      </span>
                      {point.temp_category && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({point.temp_category})
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="text-muted-foreground">pH:</span>{' '}
                      <span className="font-medium">{point.ph.toFixed(2)}</span>
                    </p>
                    {point.fertility_percentage && (
                      <p>
                        <span className="text-muted-foreground">Fertility:</span>{' '}
                        <span className="font-medium">
                          {point.fertility_percentage.toFixed(1)}%
                        </span>
                      </p>
                    )}
                    {point.collected_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(point.collected_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
