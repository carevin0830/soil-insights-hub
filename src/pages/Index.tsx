import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, BarChart3, Leaf, TrendingUp, Droplets, Thermometer } from "lucide-react";
import agriculturalBg from "@/assets/agricultural-background.png";
import SoilTemperatureMap from "@/components/SoilTemperatureMap";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${agriculturalBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/85" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        
        <div className="relative z-10 container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground drop-shadow-lg">
              Soil Health Monitoring
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/90 max-w-3xl mx-auto drop-shadow">
              Real-time agricultural data visualization for Sallapadan, Bucay, and Lagangilang
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="backdrop-blur-md bg-card/70 border-2 shadow-xl hover:bg-card/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Droplets className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">pH Monitoring</CardTitle>
                    <CardDescription>Soil acidity tracking</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-md bg-card/70 border-2 shadow-xl hover:bg-card/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Thermometer className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Temperature</CardTitle>
                    <CardDescription>Real-time soil temp</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-md bg-card/70 border-2 shadow-xl hover:bg-card/80 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Leaf className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Fertility</CardTitle>
                    <CardDescription>Nutrient analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">Live Soil Data Map</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto drop-shadow-sm">
              Interactive visualization of soil conditions across all monitored locations
            </p>
          </div>

          <div className="backdrop-blur-sm bg-card/80 rounded-2xl shadow-2xl overflow-hidden border-2">
            <SoilTemperatureMap />
          </div>

          {/* Map Legend */}
          <div className="mt-8 flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">Hot (25°C+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">Warm (20-25°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-muted-foreground">Good (15-20°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Ideal (10-15°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Cool (&lt;10°C)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto drop-shadow-sm">
              Comprehensive tools for modern agricultural monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="backdrop-blur-md bg-card/70 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/80">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Map className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>GIS Mapping</CardTitle>
                <CardDescription>
                  Interactive spatial visualization with heatmaps and location-based analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-md bg-card/70 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/80">
              <CardHeader>
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                  <BarChart3 className="w-8 h-8 text-accent" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Historical trends and statistical insights for data-driven farming decisions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-md bg-card/70 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/80">
              <CardHeader>
                <div className="p-3 rounded-xl bg-secondary/10 w-fit mb-4 group-hover:bg-secondary/20 transition-colors">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle>Real-Time Data</CardTitle>
                <CardDescription>
                  Live monitoring with instant updates and automated data collection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Monitoring Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join experts making data-driven agricultural decisions for better crop yields
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-10 shadow-xl">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t backdrop-blur-md bg-card/70 relative">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Soil Health Visualization Platform. Supporting sustainable agriculture.</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
