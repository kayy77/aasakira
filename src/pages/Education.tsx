
import React from 'react';
import { ArrowLeft, Users, Crown, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const Education = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const isPremium = subscription?.tier === 'premium';
  const communityLink = isPremium 
    ? "https://t.me/+BVlQ6Le1ORtiZTU0" // Premium community
    : "https://t.me/+YOUR_FREE_GROUP_LINK"; // Free community

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        onClick={handleBack}
        variant="ghost"
        className="mb-6 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-purple-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4">
              Education Coming Soon
            </CardTitle>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                We are working on making the Education as solid as possible. In the meantime, 
                join our community to learn with some of our traders and mentors... or use our other services.
              </p>
              
              {/* Community Link */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">
                    {isPremium ? 'Premium' : 'Free'} Community Access
                  </span>
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <a
                  href={communityLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    className={`px-8 py-3 text-lg font-semibold ${
                      isPremium 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white`}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join {isPremium ? 'Premium' : 'Free'} Community
                  </Button>
                </a>
              </div>
            </div>

            {/* Additional Services */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-white font-semibold mb-4 text-center">
                Explore Our Other Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/trading')}
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Trading Signals
                </Button>
                <Button
                  onClick={() => navigate('/combat')}
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Combat Mode
                </Button>
              </div>
            </div>

            {/* Upgrade CTA for Free Users */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 text-center">
                <h4 className="text-white font-semibold mb-2">
                  🚀 Want Premium Community Access?
                </h4>
                <p className="text-gray-300 mb-4">
                  Join our premium community for advanced strategies, 1-on-1 mentorship, and exclusive content.
                </p>
                <Button
                  onClick={() => navigate('/upgrade')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Education;
