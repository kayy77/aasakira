
import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || (isSignUp && !email)) {
      toast({
        title: "Missing Information",
        description: isSignUp ? "Please fill in all fields" : "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    let success = false;
    if (isSignUp) {
      success = await signup(username, email, password);
    } else {
      success = await login(username, password);
    }
    
    if (success) {
      toast({
        title: isSignUp ? "Welcome!" : "Welcome back!",
        description: isSignUp ? "Your account has been created successfully" : "You've successfully logged in to ForexAI",
      });
      onOpenChange(false);
    } else {
      toast({
        title: isSignUp ? "Signup Failed" : "Login Failed",
        description: isSignUp ? "Failed to create account. Please try again." : "Invalid username or password",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-purple-500/20 p-0">
        <div className="p-6">
          <DialogHeader className="space-y-4">
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-white">
                {isSignUp ? 'Join ForexAI' : 'Welcome to ForexAI'}
              </DialogTitle>
              <p className="text-gray-400">
                {isSignUp ? 'Create your account to access professional trading tools' : 'Sign in to access professional trading tools'}
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 cyber-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Professional trading signals with AI-powered market analysis
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Button 
                variant="outline" 
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                disabled={isLoading}
                onClick={toggleMode}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-center text-gray-500">
            Demo: Use any username/password. Add "premium" to username for premium features.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
