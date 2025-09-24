
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Signal, User, MessageCircle, Home, DollarSign, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Trading Journal', href: '/journal', icon: BookOpen },
    { name: 'Affiliate', href: '/affiliate', icon: DollarSign },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold gradient-text">Aasakira</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Telegram Button */}
            <Button
              onClick={() => window.open('https://t.me/aasakirafree', '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Join Community</span>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary border border-primary/30">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-sm border-white/20" align="end">
                    <DropdownMenuItem className="flex-col items-start text-white hover:bg-white/10">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
