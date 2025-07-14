
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedPremiumUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedPremiumUpgrade: React.FC<EnhancedPremiumUpgradeProps> = ({
  open,
  onOpenChange,
}) => {
  const plans = [
    {
      name: 'Aasakira Basic',
      price: 'Free',
      description: 'Get started with essential trading tools',
      features: [
        '3 AI signals per day',
        '5 meme coin scans per day',
        'Basic education content',
        '1 trading game per day',
        'Community access'
      ],
      icon: Sparkles,
      color: 'from-gray-600 to-gray-500',
      borderColor: 'border-gray-500/30',
      current: true
    },
    {
      name: 'Aasakira Elite',
      price: '$19.99/month',
      description: 'Professional trading with unlimited access',
      features: [
        'Unlimited AI signals',
        'Unlimited meme coin scanning',
        'Advanced AI education with visuals',
        'Unlimited trading games',
        'Live market data feeds',
        'Priority support',
        'Advanced analytics',
        'Custom alerts'
      ],
      icon: Crown,
      color: 'from-gold-600 to-gold-500',
      borderColor: 'border-gold-500/50',
      popular: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black/90 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-gold-400" />
              </div>
              <span className="text-2xl font-bold gradient-text">Upgrade to Elite</span>
            </div>
            <p className="text-gray-400 text-base font-normal">
              Unlock the full power of Aasakira's AI trading platform
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative glass-card border-2 ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-gold-500/30' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-gold-500 to-gold-400 text-black font-bold px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.color} mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.current 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade to Elite
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            🔒 Secure payment • Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPremiumUpgrade;
