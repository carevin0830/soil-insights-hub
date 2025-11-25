import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, BarChart3, TrendingUp, Droplets, Thermometer } from "lucide-react";
import agriculturalBg from "@/assets/agricultural-background.png";
import SoilTemperatureMap from "@/components/SoilTemperatureMap";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import Navigation from "@/components/Navigation";
import { ChevronDown } from "lucide-react";

const Index = () => {
  const mapSection = useScrollAnimation(0.2);
  const featuresSection = useScrollAnimation(0.2);

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed z-0"
        style={{ backgroundImage: `url(${agriculturalBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 container mx-auto px-4 max-w-7xl text-center">
            <h1 className="text-7xl md:text-9xl font-black mb-6 text-white tracking-tight leading-none">
              SOIL HEALTH
            </h1>
            <p className="text-lg md:text-xl mb-12 text-white/90 uppercase tracking-[0.3em] font-light">
              Monitoring Platform
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm uppercase tracking-wider px-12 py-6 shadow-2xl"
              >
                Discover
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
          </div>
        </section>

        {/* Key Stats Cards */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="backdrop-blur-md bg-card/60 border-2 shadow-xl hover:shadow-2xl transition-all group hover:bg-card/70">
                <CardHeader className="text-center">
                  <div className="mx-auto p-4 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Droplets className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">pH Monitoring</CardTitle>
                  <CardDescription className="text-base">Comprehensive soil acidity tracking and analysis</CardDescription>
                </CardHeader>
              </Card>

              <Card className="backdrop-blur-md bg-card/60 border-2 shadow-xl hover:shadow-2xl transition-all group hover:bg-card/70">
                <CardHeader className="text-center">
                  <div className="mx-auto p-4 rounded-xl bg-secondary/10 w-fit mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Thermometer className="w-10 h-10 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Temperature</CardTitle>
                  <CardDescription className="text-base">Real-time soil temperature monitoring</CardDescription>
                </CardHeader>
              </Card>

              <Card className="backdrop-blur-md bg-card/60 border-2 shadow-xl hover:shadow-2xl transition-all group hover:bg-card/70">
                <CardHeader className="text-center">
                  <div className="mx-auto p-4 rounded-xl bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                    <Map className="w-10 h-10 text-accent" />
                  </div>
                  <CardTitle className="text-2xl mb-2">GIS Mapping</CardTitle>
                  <CardDescription className="text-base">Advanced geospatial data visualization</CardDescription>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">Live Soil Data Map</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
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
          id="features"
          ref={featuresSection.ref}
          className={`py-20 relative transition-all duration-700 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">Platform Features</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
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
        <footer className="py-8 border-t border-white/10 backdrop-blur-md bg-transparent relative">
          <div className="container mx-auto px-4 text-center text-white/70">
            <p>© 2025 Soil Health Visualization Platform. Supporting sustainable agriculture.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
