import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SoilDataPoint {
  collected_at: string;
  temperature: number;
  ph: number;
  fertility_percentage: number | null;
  location_name: string | null;
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
  const [timeRange, setTimeRange] = useState<string>('30');

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
        .select('collected_at, temperature, ph, fertility_percentage, location_name, municipality_id')
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

  const chartData = formatChartData();
  const averages = calculateAverages();

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

            {/* Temperature Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Temperature Trend
                </CardTitle>
                <CardDescription>Soil temperature over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* pH Trend */}
            <Card>
              <CardHeader>
                <CardTitle>pH Level Trend</CardTitle>
                <CardDescription>Soil pH over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 14]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="pH"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
