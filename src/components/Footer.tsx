import { Camera, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">정보</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                사이트소개
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                이용약관
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                개인정보처리방침
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                연락처
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">문의</h3>
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