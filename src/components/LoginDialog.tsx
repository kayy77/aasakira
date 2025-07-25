
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface LoginDialogProps {
  children: React.ReactNode;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Account created!",
          description: "Welcome to AASAKIRA! You can start using all features immediately.",
        });
      }
      setIsOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes('User already registered')) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: isLogin ? "Login failed" : "Signup failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {isLogin ? 'Sign In to AASAKIRA' : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-600 text-white focus:border-purple-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-600 text-white focus:border-purple-500"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          
          {!isLogin && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-sm text-center">
                ✅ No email confirmation required! Start trading immediately after signup.
              </p>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
