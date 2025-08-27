import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Camera, User } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">SnapFinder</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              홈
            </Link>
            <Link 
              to="/packages" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/packages') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              패키지
            </Link>
            <Link 
              to="/photographers" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/photographers') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              사진사
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              소개
            </Link>
            
            {/* Admin Login Button */}
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <User className="h-4 w-4 mr-2" />
                관리자
              </Link>
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
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                홈
              </Link>
              <Link 
                to="/packages" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/packages') ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                패키지
              </Link>
              <Link 
                to="/photographers" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/photographers') ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                사진사
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/about') ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                소개
              </Link>
              <Button variant="outline" size="sm" asChild className="w-fit">
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <User className="h-4 w-4 mr-2" />
                  관리자
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;