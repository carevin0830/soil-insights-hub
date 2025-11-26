import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SoilDataPoint {
  collected_at: string;
  temperature: number;
  ph: number;
  fertility_percentage: number | null;
  location_name: string | null;
  nitrogen_level: number | null;
  phosphorus_level: number | null;
  potassium_level: number | null;
  municipality_id: string;
}

interface Municipality {
  id: string;
  name: string;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('90');

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMunicipality, timeRange]);

  const fetchMunicipalities = async () => {
    const { data, error } = await supabase
      .from('municipalities')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching municipalities:', error);
    } else {
      setMunicipalities(data || []);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      let query = supabase
        .from('soil_data')
        .select('collected_at, temperature, ph, fertility_percentage, location_name, municipality_id, nitrogen_level, phosphorus_level, potassium_level')
        .gte('collected_at', daysAgo.toISOString())
        .order('collected_at', { ascending: true });

      if (selectedMunicipality !== 'all') {
        query = query.eq('municipality_id', selectedMunicipality);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSoilData(data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    return soilData.map(point => ({
      date: new Date(point.collected_at).toLocaleDateString(),
      temperature: point.temperature,
      ph: point.ph,
      fertility: point.fertility_percentage || 0,
      location: point.location_name || 'Unknown',
    }));
  };

  const calculateAverages = () => {
    if (soilData.length === 0) {
      return { avgTemp: 0, avgPh: 0, avgFertility: 0 };
    }

    const sum = soilData.reduce(
      (acc, point) => ({
        temp: acc.temp + point.temperature,
        ph: acc.ph + point.ph,
        fertility: acc.fertility + (point.fertility_percentage || 0),
      }),
      { temp: 0, ph: 0, fertility: 0 }
    );

    return {
      avgTemp: (sum.temp / soilData.length).toFixed(1),
      avgPh: (sum.ph / soilData.length).toFixed(2),
      avgFertility: (sum.fertility / soilData.length).toFixed(1),
    };
  };

  const formatNPKData = () => {
    // Group data by municipality
    const municipalityData: { [key: string]: { n: number[], p: number[], k: number[], name: string } } = {};
    
    soilData.forEach(point => {
      const municipalityName = municipalities.find(m => m.id === point.municipality_id)?.name || 'Unknown';
      if (!municipalityData[point.municipality_id]) {
        municipalityData[point.municipality_id] = { n: [], p: [], k: [], name: municipalityName };
      }
      if (point.nitrogen_level) municipalityData[point.municipality_id].n.push(point.nitrogen_level);
      if (point.phosphorus_level) municipalityData[point.municipality_id].p.push(point.phosphorus_level);
      if (point.potassium_level) municipalityData[point.municipality_id].k.push(point.potassium_level);
    });

    // Calculate averages and format for radar chart
    return Object.values(municipalityData)
      .filter(data => data.n.length > 0 || data.p.length > 0 || data.k.length > 0)
      .map(data => ({
        municipality: data.name,
        Nitrogen: data.n.length > 0 ? (data.n.reduce((a, b) => a + b, 0) / data.n.length).toFixed(1) : 0,
        Phosphorus: data.p.length > 0 ? (data.p.reduce((a, b) => a + b, 0) / data.p.length).toFixed(1) : 0,
        Potassium: data.k.length > 0 ? (data.k.reduce((a, b) => a + b, 0) / data.k.length).toFixed(1) : 0,
      }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = formatChartData();
  const averages = calculateAverages();
  const npkData = formatNPKData();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Charts and historical trend analysis</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
              <SelectTrigger>
                <SelectValue placeholder="Select municipality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        ) : soilData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available for the selected filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{averages.avgTemp}°C</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {soilData.length} measurements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average pH</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{averages.avgPh}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {soilData.length} measurements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Fertility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{averages.avgFertility}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {soilData.length} measurements
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Multi-metric Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Soil Health Trend Analysis
                </CardTitle>
                <CardDescription>Historical soil health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-muted-foreground"
                    />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      name="pH"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      name="temperature"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fertility"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      name="fertility"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* NPK Nutrient Profile */}
            {npkData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>NPK Nutrient Profile</CardTitle>
                  <CardDescription>Nitrogen, Phosphorus, and Potassium levels by municipality</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={npkData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="municipality" className="text-muted-foreground" />
                      <PolarRadiusAxis className="text-muted-foreground" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Radar
                        name="Nitrogen"
                        dataKey="Nitrogen"
                        stroke="hsl(142, 76%, 36%)"
                        fill="hsl(142, 76%, 36%)"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Phosphorus"
                        dataKey="Phosphorus"
                        stroke="hsl(38, 92%, 50%)"
                        fill="hsl(38, 92%, 50%)"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Potassium"
                        dataKey="Potassium"
                        stroke="hsl(142, 71%, 45%)"
                        fill="hsl(142, 71%, 45%)"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Fertility Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Fertility Comparison</CardTitle>
                <CardDescription>Soil fertility by location</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fertility" fill="hsl(var(--accent))" name="Fertility (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
