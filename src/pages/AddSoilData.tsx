import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import { z } from 'zod';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const soilDataSchema = z.object({
  location_name: z.string().trim().min(1, 'Location name is required').max(200),
  temperature: z.number().min(-50, 'Temperature too low').max(100, 'Temperature too high'),
  ph: z.number().min(0, 'pH must be between 0 and 14').max(14, 'pH must be between 0 and 14'),
  fertility_percentage: z.number().min(0, 'Fertility must be between 0 and 100').max(100, 'Fertility must be between 0 and 100').optional(),
  nitrogen_level: z.number().min(0).optional(),
  phosphorus_level: z.number().min(0).optional(),
  potassium_level: z.number().min(0).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  municipality_id: z.string().uuid('Please select a municipality'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

interface Municipality {
  id: string;
  name: string;
}

export default function AddSoilData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [formData, setFormData] = useState({
    location_name: '',
    temperature: '',
    ph: '',
    fertility_percentage: '',
    nitrogen_level: '',
    phosphorus_level: '',
    potassium_level: '',
    notes: '',
    municipality_id: '',
  });

  useEffect(() => {
    fetchMunicipalities();
    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const fetchMunicipalities = async () => {
    const { data, error } = await supabase
      .from('municipalities')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching municipalities:', error);
      toast.error('Failed to load municipalities');
    } else {
      setMunicipalities(data || []);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (Philippines)
    const map = L.map(mapRef.current).setView([17.5, 121.5], 10);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Add click handler for location selection
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [20, 20],
        })
      }).addTo(map);

      toast.success(`Location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);

    try {
      // Parse and validate form data
      const validatedData = soilDataSchema.parse({
        location_name: formData.location_name,
        temperature: parseFloat(formData.temperature),
        ph: parseFloat(formData.ph),
        fertility_percentage: formData.fertility_percentage ? parseFloat(formData.fertility_percentage) : undefined,
        nitrogen_level: formData.nitrogen_level ? parseFloat(formData.nitrogen_level) : undefined,
        phosphorus_level: formData.phosphorus_level ? parseFloat(formData.phosphorus_level) : undefined,
        potassium_level: formData.potassium_level ? parseFloat(formData.potassium_level) : undefined,
        notes: formData.notes || undefined,
        municipality_id: formData.municipality_id,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });

      // Insert soil data
      const { error } = await supabase.from('soil_data').insert({
        location_name: validatedData.location_name,
        temperature: validatedData.temperature,
        ph: validatedData.ph,
        fertility_percentage: validatedData.fertility_percentage,
        nitrogen_level: validatedData.nitrogen_level,
        phosphorus_level: validatedData.phosphorus_level,
        potassium_level: validatedData.potassium_level,
        notes: validatedData.notes,
        municipality_id: validatedData.municipality_id,
        location: `POINT(${validatedData.longitude} ${validatedData.latitude})`,
        collected_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Soil data added successfully!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error adding soil data:', error);
        toast.error('Failed to add soil data');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Add Soil Data</h1>
          <p className="text-muted-foreground">Record new soil test measurements</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Location Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Click on the map to select the measurement location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px] rounded-lg overflow-hidden border">
                  <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
                </div>
                
                {selectedLocation && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location_name">Location Name *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="e.g., Field A, North Section"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality_id">Municipality *</Label>
                  <Select
                    value={formData.municipality_id}
                    onValueChange={(value) => setFormData({ ...formData, municipality_id: value })}
                    required
                  >
                    <SelectTrigger id="municipality_id">
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Basic Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C) *</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      placeholder="e.g., 25.5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ph">pH Level *</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.01"
                      value={formData.ph}
                      onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                      placeholder="e.g., 6.5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertility_percentage">Fertility (%)</Label>
                    <Input
                      id="fertility_percentage"
                      type="number"
                      step="0.1"
                      value={formData.fertility_percentage}
                      onChange={(e) => setFormData({ ...formData, fertility_percentage: e.target.value })}
                      placeholder="e.g., 75.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrient Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrient Levels (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen_level">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen_level"
                      type="number"
                      step="0.01"
                      value={formData.nitrogen_level}
                      onChange={(e) => setFormData({ ...formData, nitrogen_level: e.target.value })}
                      placeholder="mg/kg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phosphorus_level">Phosphorus (P)</Label>
                    <Input
                      id="phosphorus_level"
                      type="number"
                      step="0.01"
                      value={formData.phosphorus_level}
                      onChange={(e) => setFormData({ ...formData, phosphorus_level: e.target.value })}
                      placeholder="mg/kg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="potassium_level">Potassium (K)</Label>
                    <Input
                      id="potassium_level"
                      type="number"
                      step="0.01"
                      value={formData.potassium_level}
                      onChange={(e) => setFormData({ ...formData, potassium_level: e.target.value })}
                      placeholder="mg/kg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional observations or notes..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.notes.length}/1000 characters
                </p>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Soil Data'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
