import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import MultiStepSignupDialog from './MultiStepSignupDialog';

interface AuthenticationDialogProps {
  children: React.ReactNode;
}

const AuthenticationDialog: React.FC<AuthenticationDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'select' | 'login'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      setIsOpen(false);
      setEmail('');
      setPassword('');
      setMode('select');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setMode('select');
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {mode === 'select' ? 'Welcome to AASAKIRA' : 'Sign In to AASAKIRA'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'select' && (
          <div className="space-y-4">
            <div className="text-center text-gray-400 mb-6">
              Choose how you'd like to get started
            </div>
            
            <Button
              onClick={() => setMode('login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
            >
              Sign In
            </Button>
            
            <div className="text-center text-gray-500">or</div>
            
            <MultiStepSignupDialog>
              <Button
                variant="outline"
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white py-3 text-lg font-semibold"
              >
                Create New Account
              </Button>
            </MultiStepSignupDialog>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              ✅ No email confirmation required • Start trading immediately
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div>
            <Button
              onClick={() => setMode('select')}
              variant="ghost"
              className="mb-4 text-gray-400 hover:text-white p-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to options
            </Button>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center">
                <MultiStepSignupDialog>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Don't have an account? Sign up
                  </Button>
                </MultiStepSignupDialog>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthenticationDialog;