import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-8">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <Leaf className="w-8 h-8" />
        </Link>

        {/* Center Menu */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">
          <Link to="/" className="hover:text-primary transition-colors uppercase tracking-wider text-sm">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-primary transition-colors uppercase tracking-wider text-sm">
            Dashboard
          </Link>
          <Link to="/analytics" className="hover:text-primary transition-colors uppercase tracking-wider text-sm">
            Analytics
          </Link>
          <a href="#features" className="hover:text-primary transition-colors uppercase tracking-wider text-sm">
            Features
          </a>
        </div>

        {/* CTA Button */}
        <Link to="/auth">
          <Button 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-background transition-all uppercase tracking-wider text-sm"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
