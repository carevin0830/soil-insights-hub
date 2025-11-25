import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Map, BarChart3, Database, Users, Leaf, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-soil-health.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Soil Health Visualization Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Monitoring and analyzing soil conditions across Sallapadan, Bucay, and Lagangilang municipalities
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for soil health monitoring and agricultural decision support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Map className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>Interactive GIS Mapping</CardTitle>
                <CardDescription>
                  Visualize soil data points across municipalities with heatmaps and spatial analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Database className="w-12 h-12 mb-4 text-secondary" />
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Store and manage soil pH, temperature, and fertility data with CSV/Excel import
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <BarChart3 className="w-12 h-12 mb-4 text-accent" />
                <CardTitle>Analytics & Charts</CardTitle>
                <CardDescription>
                  Historical trends, comparative analysis, and statistical insights for informed decisions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Leaf className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>Decision Support</CardTitle>
                <CardDescription>
                  Automatic soil health interpretation with crop and fertilizer recommendations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="w-12 h-12 mb-4 text-secondary" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Tailored experiences for farmers, agricultural experts, and researchers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mb-4 text-accent" />
                <CardTitle>Real-Time Monitoring</CardTitle>
                <CardDescription>
                  Track soil conditions over time with historical trend analysis and reporting
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Municipalities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Covered Municipalities</h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive soil health monitoring across three key agricultural areas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {["Sallapadan", "Bucay", "Lagangilang"].map((municipality) => (
              <Card key={municipality} className="text-center border-2 hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{municipality}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Active soil monitoring and data collection for improved agricultural productivity
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Monitor Your Soil Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join agricultural experts and researchers in making data-driven decisions for better crop yields
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Soil Health Visualization Platform. Supporting sustainable agriculture.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
