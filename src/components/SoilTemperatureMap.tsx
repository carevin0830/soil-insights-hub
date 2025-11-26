import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [editingPoint, setEditingPoint] = useState<SoilDataPoint | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<SoilDataPoint | null>(null);
  const [editForm, setEditForm] = useState({
    temperature: '',
    ph: '',
    fertility_percentage: '',
    location_name: ''
  });

  useEffect(() => {
    fetchSoilData();
  }, []);

  useEffect(() => {
    // Initialize map when data is loaded and container is ready
    if (!loading && soilData.length > 0 && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, soilData]);

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

  const handleEdit = (point: SoilDataPoint) => {
    setEditingPoint(point);
    setEditForm({
      temperature: point.temperature.toString(),
      ph: point.ph.toString(),
      fertility_percentage: point.fertility_percentage?.toString() || '',
      location_name: point.location_name || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPoint) return;

    try {
      const { error } = await supabase
        .from('soil_data')
        .update({
          temperature: parseFloat(editForm.temperature),
          ph: parseFloat(editForm.ph),
          fertility_percentage: editForm.fertility_percentage ? parseFloat(editForm.fertility_percentage) : null,
          location_name: editForm.location_name
        })
        .eq('id', editingPoint.id);

      if (error) throw error;

      toast.success('Soil data updated successfully');
      setEditingPoint(null);
      
      // Refresh data without removing map
      await fetchSoilData();
      
      // Reload the page to refresh the map
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to update soil data');
      console.error('Error updating soil data:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingPoint) return;

    try {
      const { data, error } = await supabase
        .from('soil_data')
        .delete()
        .eq('id', deletingPoint.id)
        .select();

      if (error) throw error;

      // Check if anything was actually deleted
      if (!data || data.length === 0) {
        toast.error('Failed to delete: You may not have permission to delete this data.');
        setDeletingPoint(null);
        return;
      }

      toast.success('Soil data deleted successfully');
      setDeletingPoint(null);
      
      // Reload the page to refresh the map
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to delete soil data');
      console.error('Error deleting soil data:', error);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Calculate center
    const avgLat = soilData.reduce((sum, p) => sum + p.coordinates![0], 0) / soilData.length;
    const avgLng = soilData.reduce((sum, p) => sum + p.coordinates![1], 0) / soilData.length;

    // Create map
    const map = L.map(mapRef.current).setView([avgLat, avgLng], 10);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Add markers
    soilData.forEach(point => {
      if (!point.coordinates) return;

      const color = getTemperatureColor(point.temperature);
      
      // Create circle marker
      const marker = L.circleMarker(point.coordinates, {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h4 style="font-weight: 600; margin-bottom: 8px;">${point.location_name || 'Unknown Location'}</h4>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px;">
            <p>
              <span style="font-weight: 500;">Temperature:</span>
              <span style="color: ${color}; font-weight: 600;"> ${point.temperature.toFixed(1)}°C</span>
              ${point.temp_category ? `<span style="font-size: 12px;"> (${point.temp_category})</span>` : ''}
            </p>
            <p><span style="font-weight: 500;">pH:</span> ${point.ph.toFixed(2)}</p>
            ${point.fertility_percentage ? `<p><span style="font-weight: 500;">Fertility:</span> ${point.fertility_percentage.toFixed(1)}%</p>` : ''}
            ${point.collected_at ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${new Date(point.collected_at).toLocaleDateString()}</p>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
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

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Interactive Map */}
        <div className="mb-6 h-[500px] rounded-lg overflow-hidden border border-border">
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
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
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(point)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeletingPoint(point)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingPoint} onOpenChange={(open) => !open && setEditingPoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Soil Data</DialogTitle>
            <DialogDescription>
              Update the soil measurements for this location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={editForm.location_name}
                onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={editForm.temperature}
                onChange={(e) => setEditForm({ ...editForm, temperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ph">pH Level</Label>
              <Input
                id="ph"
                type="number"
                step="0.01"
                value={editForm.ph}
                onChange={(e) => setEditForm({ ...editForm, ph: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fertility">Fertility Percentage</Label>
              <Input
                id="fertility"
                type="number"
                step="0.1"
                value={editForm.fertility_percentage}
                onChange={(e) => setEditForm({ ...editForm, fertility_percentage: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPoint(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPoint} onOpenChange={(open) => !open && setDeletingPoint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Soil Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the data for "{deletingPoint?.location_name || 'Unknown Location'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
