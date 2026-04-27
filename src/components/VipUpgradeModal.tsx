import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Crown, Sparkles, MessageSquare } from 'lucide-react';

const STARTRADER_URL =
  'https://www.startrader.com/live-account/?affid=MTcwOTQ3NTc=&ibpRebateCode=MTcwOTQ3NTdTVDEwMjMw';
const TELEGRAM_CONTACT_LINK = 'https://t.me/khaiwh';

interface VipUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { title: 'Fill in your details', desc: 'Use your real name and email — must match your ID.' },
  { title: 'Choose platform', desc: 'MT5 is recommended for the best signal compatibility.' },
  { title: 'Select Hedge STP account', desc: 'Required to receive the 100% deposit bonus.' },
  { title: 'Choose your account currency', desc: 'GBP, USD or EUR — pick what suits you.' },
  { title: 'Verify your account', desc: 'Upload your ID and Proof of Address (POA).' },
  {
    title: 'Opt into the 100% Deposit Bonus',
    desc: 'Inside StarTrader, go to Promo → Promotions, opt in, then deposit your funds.',
  },
];

const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            Become a VIP Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xl px-5 py-2 rounded-full mb-3">
              100% DEPOSIT BONUS
            </div>
            <p className="text-gray-300 text-base">
              VIP signals are unlocked when you sign up with our partner broker
              <span className="text-amber-400 font-semibold"> StarTrader</span>. Follow the steps
              below — it takes about 5 minutes.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-black/30 p-5">
            <h3 className="text-amber-400 font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              How to activate your VIP access
            </h3>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="bg-gradient-to-br from-amber-500 to-orange-500 text-black text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white font-semibold leading-tight">{step.title}</p>
                    <p className="text-gray-400 text-sm">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Button
            onClick={() => window.open(STARTRADER_URL, '_blank')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-6 text-lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open StarTrader Account & Get 100% Bonus
          </Button>

          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 text-center">
            <p className="text-sm text-gray-300 mb-3">
              Already have a StarTrader account funded? Message us on Telegram to get added to the
              VIP channel.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(TELEGRAM_CONTACT_LINK, '_blank')}
              className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact us on Telegram
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

export default VipUpgradeModal;
