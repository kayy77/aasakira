import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CommunityInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityInviteModal: React.FC<CommunityInviteModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const handleJoinTelegram = () => {
    window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl font-zen-maru mb-2">
            📈 Join Our Trading Community
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          <p className="text-gray-300 text-lg leading-relaxed">
            Get daily trade ideas, learn how to trade from scratch, and follow the market together with other traders.
          </p>
          
          <div className="glass-card p-6 border-purple-500/20 space-y-3">
            <div className="text-green-400 font-semibold text-left space-y-2">
              <p>📊 Daily trade setups & signals</p>
              <p>📚 Free trading education</p>
              <p>💬 Active community support</p>
              <p>🎯 Live market analysis</p>
            </div>
          </div>
          
          <Button
            onClick={handleJoinTelegram}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 text-lg"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            👉 Join Our Free Telegram Community
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            I'll join later
          </Button>
          
          <p className="text-xs text-gray-500">
            Join 1000+ traders learning and growing together
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityInviteModal;
