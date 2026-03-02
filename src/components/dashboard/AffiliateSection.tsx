import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plane, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';

const AFFILIATE_TELEGRAM = 'https://t.me/+CEg8DUQuPXQ5MWRk';

const AffiliateSection = () => {
  const handleJoinTelegram = () => {
    window.open(AFFILIATE_TELEGRAM, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-8 md:p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4" />
              Affiliate Programme
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Earn Up To <span className="text-yellow-300">£12 Per Trade</span>
              <br />Live Life On Your Terms
            </h2>
            <p className="text-emerald-50 text-lg max-w-xl">
              Join our exclusive affiliate training where we teach you how to build 
              <strong className="text-white"> 4-6 figures/month</strong> in passive income. 
              Travel the world while earning.
            </p>
            <Button 
              onClick={handleJoinTelegram}
              size="lg"
              className="bg-white text-emerald-700 hover:bg-yellow-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all hover:scale-105"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Join Affiliate Training
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Earnings Visual */}
          <div className="shrink-0">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4 min-w-[260px]">
              <p className="text-emerald-100 text-sm font-medium text-center">Potential Monthly Earnings</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-white">£3,600</span>
                <span className="text-emerald-200 text-sm block mt-1">300 referral trades/month</span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-emerald-100">
                  <span>Per trade</span>
                  <span className="font-semibold text-white">£12</span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span>Recurring</span>
                  <span className="font-semibold text-yellow-300">✓ Lifetime</span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span>Payouts</span>
                  <span className="font-semibold text-white">Weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BenefitCard 
          icon={<DollarSign className="h-6 w-6" />}
          title="£12 Per Trade"
          description="Earn every time your referrals trade. No caps, no limits."
          gradient="from-yellow-500/20 to-amber-500/10"
          iconColor="text-yellow-400"
          borderColor="border-yellow-500/20"
        />
        <BenefitCard 
          icon={<TrendingUp className="h-6 w-6" />}
          title="4-6 Figures/Month"
          description="Learn our proven system to scale your affiliate income fast."
          gradient="from-emerald-500/20 to-green-500/10"
          iconColor="text-emerald-400"
          borderColor="border-emerald-500/20"
        />
        <BenefitCard 
          icon={<Plane className="h-6 w-6" />}
          title="Freedom Lifestyle"
          description="Work from anywhere. Travel the world with passive income."
          gradient="from-sky-500/20 to-blue-500/10"
          iconColor="text-sky-400"
          borderColor="border-sky-500/20"
        />
        <BenefitCard 
          icon={<Globe className="h-6 w-6" />}
          title="Global Community"
          description="Join a network of affiliates all building financial freedom."
          gradient="from-purple-500/20 to-violet-500/10"
          iconColor="text-purple-400"
          borderColor="border-purple-500/20"
        />
      </div>

      {/* CTA Card */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="p-4 rounded-2xl bg-emerald-500/20 shrink-0">
              <Zap className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Ready to Start Earning?
              </h3>
              <p className="text-muted-foreground">
                Join our private Telegram where we'll train you step-by-step on how to build your affiliate empire with Aasakira.
              </p>
            </div>
            <Button 
              onClick={handleJoinTelegram}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-5 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-105"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Training Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  borderColor: string;
}

const BenefitCard = ({ icon, title, description, gradient, iconColor, borderColor }: BenefitCardProps) => (
  <Card className={`bg-gradient-to-br ${gradient} ${borderColor} hover:scale-[1.02] transition-transform`}>
    <CardContent className="p-5 space-y-3">
      <div className={`p-3 rounded-xl bg-background/50 w-fit ${iconColor}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default AffiliateSection;
