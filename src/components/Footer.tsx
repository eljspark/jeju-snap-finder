import { Link } from "react-router-dom";
import { Camera, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-start">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">연락처</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>jisangellenpark@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;