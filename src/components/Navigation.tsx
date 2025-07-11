import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button"
import LoginDialog from './LoginDialog';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FX</span>
            </div>
            <span className="text-xl font-bold gradient-text">ForexAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors hover-glow"
            >
              Home
            </Link>
            <Link 
              to="/signals" 
              className="text-gray-300 hover:text-white transition-colors hover-glow"
            >
              Signals
            </Link>
            <Link 
              to="/memecoins" 
              className="text-gray-300 hover:text-white transition-colors hover-glow"
            >
              Meme Coins
            </Link>
            <Link 
              to="/education" 
              className="text-gray-300 hover:text-white transition-colors hover-glow"
            >
              AI Mentor
            </Link>
            
            <div className="flex items-center space-x-3">
              {user && (
                <span className="text-sm text-gray-300">
                  Welcome, {user.username}
                  {user.isPremium && <span className="ml-1 text-purple-400">✨</span>}
                </span>
              )}
              <Button 
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover-lift"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/signals" 
                className="text-gray-300 hover:text-white transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Signals
              </Link>
              <Link 
                to="/memecoins" 
                className="text-gray-300 hover:text-white transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Meme Coins
              </Link>
              <Link 
                to="/education" 
                className="text-gray-300 hover:text-white transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Mentor
              </Link>
              {user && (
                <div className="px-2 py-1 text-sm text-gray-300 border-t border-white/10 pt-4">
                  Welcome, {user.username}
                  {user.isPremium && <span className="ml-1 text-purple-400">✨</span>}
                </div>
              )}
              <Button 
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </nav>
  );
};

export default Navigation;
