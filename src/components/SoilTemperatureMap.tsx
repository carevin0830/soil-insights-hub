import { useEffect, useState, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import 'leaflet/dist/leaflet.css';

// Lazy load the map component
const LazyMap = lazy(() => import('./SoilMap'));

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

  return (
    <Card className="overflow-hidden">
      <Suspense
        fallback={
          <div className="h-[500px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        }
      >
        <LazyMap soilData={soilData} />
      </Suspense>
      
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
