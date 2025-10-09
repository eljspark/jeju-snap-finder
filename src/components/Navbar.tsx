import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Camera, User } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">SnapFinder</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              홈
            </a>
            <a 
              href="/packages" 
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              패키지
            </a>
            <a 
              href="/photographers" 
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              사진사
            </a>
            <a 
              href="/about" 
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              소개
            </a>
            
            {/* Admin Login Button */}
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">
                <User className="h-4 w-4 mr-2" />
                관리자
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a 
                href="/" 
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                홈
              </a>
              <a 
                href="/packages" 
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                패키지
              </a>
              <a 
                href="/photographers" 
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                사진사
              </a>
              <a 
                href="/about" 
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                소개
              </a>
              <Button variant="outline" size="sm" asChild className="w-fit">
                <a href="/admin" onClick={() => setIsOpen(false)}>
                  <User className="h-4 w-4 mr-2" />
                  관리자
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
