import { Link } from "react-router-dom";
import { Camera, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SnapFinder</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Discover the best photography packages in Jeju Island. Capture your perfect moments with professional photographers.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/packages" className="block text-muted-foreground hover:text-primary transition-colors">
                Browse Packages
              </Link>
              <Link to="/photographers" className="block text-muted-foreground hover:text-primary transition-colors">
                Our Photographers
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Packages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Popular Packages</h3>
            <div className="space-y-2 text-sm">
              <Link to="/packages?occasion=wedding" className="block text-muted-foreground hover:text-primary transition-colors">
                Wedding Photography
              </Link>
              <Link to="/packages?occasion=couple" className="block text-muted-foreground hover:text-primary transition-colors">
                Couple Portraits
              </Link>
              <Link to="/packages?occasion=family" className="block text-muted-foreground hover:text-primary transition-colors">
                Family Sessions
              </Link>
              <Link to="/packages?occasion=solo" className="block text-muted-foreground hover:text-primary transition-colors">
                Solo Photography
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Jeju Island, South Korea</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+82 64 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@snapfinder.co.kr</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SnapFinder. All rights reserved. | Built with ❤️ for Jeju Island</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;