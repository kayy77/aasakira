
import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PremiumUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PremiumUpgrade = ({ open, onOpenChange }: PremiumUpgradeProps) => {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Coming Soon!",
      description: "Premium upgrade functionality will be available soon. Stay tuned!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-purple-500/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Unlock unlimited access to all AASAKIRA features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white">Unlimited trading signals</span>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-white">Unlimited meme coin scans</span>
            </div>
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-white">Full AI mentor access</span>
            </div>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-white">Priority support</span>
            </div>
          </div>

          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            Upgrade Now
          </Button>

          <p className="text-xs text-center text-gray-500">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgrade;
