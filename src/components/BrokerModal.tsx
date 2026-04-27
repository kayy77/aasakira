import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare } from 'lucide-react';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerUrl?: string;
  countryName?: string;
}

const STARTRADER_URL = 'https://www.startrader.com/live-account/?affid=MTcwOTQ3NTc=&ibpRebateCode=MTcwOTQ3NTdTVDEwMjMw';

const BrokerModal: React.FC<BrokerModalProps> = ({ 
  isOpen, 
  onClose, 
  brokerUrl, 
  countryName 
}) => {
  const handleSignUp = () => {
    window.open(STARTRADER_URL, '_blank');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/447500659269', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl font-zen-maru mb-2">
            🚀 Don't have a trading account yet?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Main Offer */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-2xl px-6 py-2 rounded-full mb-4">
              100% DEPOSIT BONUS
            </div>
            <p className="text-gray-300 text-lg">
              Get the best spreads and trading conditions with StarTrader!
            </p>
          </div>
          
          {/* Steps */}
          <div className="glass-card p-5 border-green-500/20">
            <h3 className="text-green-400 font-bold text-lg mb-4">📋 How to Get Your Bonus:</h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                <span>Fill in your details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                <span>Choose platform <strong className="text-green-400">(MT5 is recommended)</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                <span>Select <strong className="text-green-400">Hedge STP account</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span>
                <span>Choose your account currency</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">5</span>
                <span>Verify your account with ID & Proof of Address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">6</span>
                <span>Go to <strong className="text-green-400">Promo (Promotions)</strong> → Opt into the 100% deposit bonus → Deposit your funds!</span>
              </li>
            </ol>
          </div>

          <Button
            onClick={handleSignUp}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Account & Get 100% Bonus
          </Button>

          {/* Affiliate Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="glass-card p-5 border-purple-500/20">
              <h3 className="text-purple-400 font-bold text-lg mb-2">💰 Become an Affiliate</h3>
              <p className="text-gray-300 mb-3">
                Earn <strong className="text-green-400">up to £18 per 1.0 lot</strong> — the highest paying rebate in the FX game!
              </p>
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact +44 7500 659269 on WhatsApp
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Trading involves risk. Only trade with money you can afford to lose.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerModal;