
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Signal, Home, User, LogIn, Crown } from 'lucide-react';
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
import AuthenticationDialog from '@/components/AuthenticationDialog';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Signals', href: '/live-signals', icon: Signal },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold gradient-text">
          Aasakira
        </Link>
        
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown or Sign In Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary border border-primary/30">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-sm border-white/20 z-50" align="end">
                <DropdownMenuItem className="flex-col items-start text-white hover:bg-white/10">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-gray-400">Free Plan</div>
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
            <AuthenticationDialog>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            </AuthenticationDialog>
          )}
          
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
            <div className="flex flex-col h-full pt-20 px-4">
              <div className="flex-1">
                <nav className="space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="p-4 border-t border-white/10">
                <div className="text-center text-gray-400 text-sm">
                  Aasakira Trading Platform
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavigation;
