import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, BarChart3, Leaf, TrendingUp, Droplets, Thermometer } from "lucide-react";
import agriculturalBg from "@/assets/agricultural-background.png";
import SoilTemperatureMap from "@/components/SoilTemperatureMap";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const Index = () => {
  const mapSection = useScrollAnimation(0.2);
  const featuresSection = useScrollAnimation(0.2);

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${agriculturalBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/50" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        
        <div className="relative z-10 container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              Soil Health Monitoring
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/90 max-w-3xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
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
            <Card className="backdrop-blur-md bg-card/90 border-2 shadow-xl hover:bg-card/95 transition-colors">
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

            <Card className="backdrop-blur-md bg-card/90 border-2 shadow-xl hover:bg-card/95 transition-colors">
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

            <Card className="backdrop-blur-md bg-card/90 border-2 shadow-xl hover:bg-card/95 transition-colors">
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
      <section 
        ref={mapSection.ref}
        className={`py-20 relative transition-all duration-700 ${
          mapSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">Live Soil Data Map</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Interactive visualization of soil conditions across all monitored locations
            </p>
          </div>

          <div className="backdrop-blur-sm bg-card/90 rounded-2xl shadow-2xl overflow-hidden border-2">
            <SoilTemperatureMap />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresSection.ref}
        className={`py-20 relative transition-all duration-700 ${
          featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Comprehensive tools for modern agricultural monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="backdrop-blur-md bg-card/90 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/95">
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

            <Card className="backdrop-blur-md bg-card/90 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/95">
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

            <Card className="backdrop-blur-md bg-card/90 border-2 hover:border-primary transition-all hover:shadow-lg group hover:bg-card/95">
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

      {/* Footer */}
      <footer className="py-8 border-t backdrop-blur-md bg-card/90 relative">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Soil Health Visualization Platform. Supporting sustainable agriculture.</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
