import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, TrendingUp, ExternalLink, Mail, MessageSquare } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Affiliate = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-4">
              Make Money in Your Sleep
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join our affiliate program and earn commissions by sharing our trading signals with your network
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.open('https://aff.fxlvls.com/registration?refAff=10812', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Start Earning Now
            </Button>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <DollarSign className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>High Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Earn competitive commissions for every successful referral you bring to our platform
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Passive Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Build recurring revenue streams that work for you around the clock
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Growing Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Tap into the expanding forex and trading education market
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-12 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
              <CardDescription>Simple steps to start earning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sign Up</h3>
                    <p className="text-muted-foreground">
                      Register for our affiliate program using the link below
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Get Approved</h3>
                    <p className="text-muted-foreground">
                      Contact us to get your affiliate account activated and start promoting
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Start Earning</h3>
                    <p className="text-muted-foreground">
                      Share your unique links and earn commissions on every conversion
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription>Join thousands of affiliates earning with us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 mb-6"
                  onClick={() => window.open('https://aff.fxlvls.com/registration?refAff=10812', '_blank')}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Register as Affiliate
                </Button>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  After registration, contact us to activate your account:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => window.open('mailto:aasakiraltd@gmail.com', '_blank')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    aasakiraltd@gmail.com
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => window.open('https://t.me/khaiwh', '_blank')}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    @khaiwh on Telegram
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Affiliate;