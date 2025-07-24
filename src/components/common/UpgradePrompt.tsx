
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, TrendingUp, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  feature?: string;
  onClose?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title = "Upgrade to Premium",
  description = "You've reached your daily limit as a free user.",
  feature = "unlimited signals",
  onClose
}) => {
  const navigate = useNavigate();

  const premiumFeatures = [
    { icon: TrendingUp, text: "Unlimited signal generation" },
    { icon: Users, text: "Premium community access" },
    { icon: Shield, text: "Advanced risk management tools" },
    { icon: Zap, text: "Priority support" }
  ];

  const handleUpgrade = () => {
    navigate('/upgrade');
    onClose?.();
  };

  return (
    <Card className="glass-card border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white mb-2">
          {title}
        </CardTitle>
        <p className="text-gray-300 mb-4">{description}</p>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2">
          Get {feature} now!
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <feature.icon className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="text-3xl font-bold text-yellow-400">
            $29.99<span className="text-lg text-gray-400">/month</span>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade Now
            </Button>
            
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                Maybe Later
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            💡 7-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
