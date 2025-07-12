
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity, BookOpen, Zap, TrendingUp, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoginDialog from './LoginDialog';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Signals', path: '/signals', icon: Zap },
    { name: 'Education', path: '/education', icon: BookOpen },
    { name: 'Trading', path: '/trading', icon: Activity },
    { name: 'Meme Coins', path: '/memecoins', icon: Coins },
  ];

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold gradient-text">TradingPro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-purple-600 text-white text-sm">
                          {getUserInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="text-gray-300 hover:text-white">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-gray-300 hover:text-white cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-purple-600/20 text-purple-400'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {getUserInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span>Dashboard</span>
                    </Link>
                    <Button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 w-full mt-2"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
