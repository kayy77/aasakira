
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Crown, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoginDialog from './LoginDialog';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold gradient-text">AASAKIRA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Only show navigation links if user is authenticated */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/" 
                  className={`transition-colors hover-glow ${
                    location.pathname === '/' 
                      ? 'text-purple-400 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/signals" 
                  className={`transition-colors hover-glow ${
                    location.pathname === '/signals' 
                      ? 'text-purple-400 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  AI Signals
                </Link>
                <Link 
                  to="/memecoins" 
                  className={`transition-colors hover-glow ${
                    location.pathname === '/memecoins' 
                      ? 'text-purple-400 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Meme Scanner
                </Link>
                <Link 
                  to="/education" 
                  className={`transition-colors hover-glow ${
                    location.pathname === '/education' 
                      ? 'text-purple-400 font-semibold' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  AI Mentor
                </Link>
              </>
            )}
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      {user.username}
                    </span>
                    {user.role === 'premium' ? (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                        <Activity className="w-3 h-3 mr-1" />
                        Free
                      </Badge>
                    )}
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover-lift"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift"
                  onClick={handleLogin}
                >
                  Login / Sign Up
                </Button>
              )}
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
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className={`px-2 py-1 transition-colors ${
                      location.pathname === '/' 
                        ? 'text-purple-400 font-semibold' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/signals" 
                    className={`px-2 py-1 transition-colors ${
                      location.pathname === '/signals' 
                        ? 'text-purple-400 font-semibold' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    AI Signals
                  </Link>
                  <Link 
                    to="/memecoins" 
                    className={`px-2 py-1 transition-colors ${
                      location.pathname === '/memecoins' 
                        ? 'text-purple-400 font-semibold' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Meme Scanner
                  </Link>
                  <Link 
                    to="/education" 
                    className={`px-2 py-1 transition-colors ${
                      location.pathname === '/education' 
                        ? 'text-purple-400 font-semibored' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    AI Mentor
                  </Link>
                  <div className="px-2 py-1 border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-300">{user?.username}</span>
                      {user?.role === 'premium' ? (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
                  onClick={handleLogin}
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </nav>
  );
};

export default Navigation;
