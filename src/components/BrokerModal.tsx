import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerUrl: string;
  countryName: string;
}

const BrokerModal: React.FC<BrokerModalProps> = ({ 
  isOpen, 
  onClose, 
  brokerUrl, 
  countryName 
}) => {
  const handleSignUp = () => {
    if (brokerUrl === 'coming-soon') {
      // Handle US case
      return;
    }
    window.open(brokerUrl, '_blank');
    onClose();
  };

  const isComingSoon = brokerUrl === 'coming-soon';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl font-zen-maru mb-2">
            🚀 Don't have a trading account yet?
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          <p className="text-gray-300 text-lg">
            Want a deposit bonus on your first deposit? Get the best spreads and trading conditions.
          </p>
          
          {!isComingSoon ? (
            <div className="space-y-4">
              <div className="glass-card p-4 border-purple-500/20">
                <p className="text-sm text-gray-400 mb-2">Trusted broker for {countryName}</p>
                <div className="text-green-400 font-semibold text-left">
                  ✅ Tight spreads from 0.0 pips<br/>
                  ✅ Deposit bonus on first deposit<br/>
                  ✅ Regulated & trusted worldwide
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSignUp}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg"
                >
                  Sign Up Now
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-card p-4 border-yellow-500/20">
                <p className="text-yellow-400 font-semibold text-lg mb-2">
                  🇺🇸 We are actively securing a trusted US broker deal. Stay tuned!
                </p>
                <p className="text-gray-400">
                  We're working hard to bring you the best trading conditions available for US residents.
                </p>
              </div>
              
              <Button
                onClick={onClose}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                Got it, thanks!
              </Button>
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            Trading involves risk. Only trade with money you can afford to lose.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerModal;