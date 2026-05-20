import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Users, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GrowthOpportunitiesProps {
  isPremium: boolean;
  isAffiliate: boolean;
}

const GrowthOpportunities = ({ isPremium, isAffiliate }: GrowthOpportunitiesProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Growth & Opportunities</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Upgrade Prompt */}
        {!isPremium && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock unlimited signals, advanced analytics, and priority support.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/pricing')}
                  >
                    View Plans
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affiliate Prompt */}
        {!isAffiliate && (
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">Become an Affiliate</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn rewards by sharing the platform with your network.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => navigate('/affiliate')}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Discovery */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Lightbulb className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Explore Features</h3>
                <p className="text-sm text-muted-foreground">
                  Discover AI signals, setup scanner, and live market analysis.
                </p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="mt-2"
                  onClick={() => navigate('/live-signals')}
                >
                  Explore
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GrowthOpportunities;
