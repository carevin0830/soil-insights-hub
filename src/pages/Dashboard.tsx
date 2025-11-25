import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, Map, BarChart3, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import SoilTemperatureMap from "@/components/SoilTemperatureMap";

interface DashboardStats {
  totalSamples: number;
  avgPh: number;
  avgTemp: number;
  avgFertility: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSamples: 0,
    avgPh: 0,
    avgTemp: 0,
    avgFertility: 0,
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchStats();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("soil_data")
        .select("ph, temperature, fertility_percentage");

      if (error) throw error;

      if (data && data.length > 0) {
        const totalSamples = data.length;
        const avgPh = data.reduce((sum, item) => sum + (Number(item.ph) || 0), 0) / totalSamples;
        const avgTemp = data.reduce((sum, item) => sum + (Number(item.temperature) || 0), 0) / totalSamples;
        const avgFertility = data.reduce((sum, item) => sum + (Number(item.fertility_percentage) || 0), 0) / totalSamples;

        setStats({
          totalSamples,
          avgPh: Number(avgPh.toFixed(2)),
          avgTemp: Number(avgTemp.toFixed(1)),
          avgFertility: Number(avgFertility.toFixed(1)),
        });
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Soil Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Samples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSamples}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all municipalities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average pH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgPh || "N/A"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soil acidity level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgTemp || "N/A"}°C</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soil temperature
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Fertility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgFertility || "N/A"}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soil fertility
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Soil Temperature Map</h2>
          </div>
          <SoilTemperatureMap />
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/add-soil-data')}>
            <CardHeader>
              <Plus className="w-10 h-10 mb-3 text-secondary" />
              <CardTitle>Add Soil Data</CardTitle>
              <CardDescription>
                Record new soil test measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/analytics')}>
            <CardHeader>
              <BarChart3 className="w-10 h-10 mb-3 text-accent" />
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                Charts and historical trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                View Charts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Welcome to the Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You're currently viewing the dashboard. More features including interactive maps,
              data entry forms, and advanced analytics are being developed. The platform monitors
              soil health across Sallapadan, Bucay, and Lagangilang municipalities.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
