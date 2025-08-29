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
              Get the best broker deals or use our services for your business
            </p>
          </div>

          {/* Broker Deal Section */}
          <Card className="mb-12 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">Get Your Own Broker Deal</CardTitle>
              <CardDescription className="text-center text-lg">
                Get the best broker deal in the market. Sign up through this link to apply and we will get you a deal - no one else is beating our deals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.open('https://aff.fxlvls.com/registration?refAff=10812', '_blank')}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Apply for Broker Deal
                </Button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">Why This Is Good For You?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-primary/20 bg-background/50">
                    <CardHeader className="text-center">
                      <Users className="h-10 w-10 mx-auto text-primary mb-3" />
                      <CardTitle className="text-lg">Have a Community of Traders?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        Monetize your trading community with the best broker deals available
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-background/50">
                    <CardHeader className="text-center">
                      <TrendingUp className="h-10 w-10 mx-auto text-primary mb-3" />
                      <CardTitle className="text-lg">Have a Big Following?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        Turn your influence into consistent revenue streams
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-background/50">
                    <CardHeader className="text-center">
                      <DollarSign className="h-10 w-10 mx-auto text-primary mb-3" />
                      <CardTitle className="text-lg">Looking to Get Into Affiliate Game?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        Start your affiliate journey with industry-leading commissions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-background/50">
                    <CardHeader className="text-center">
                      <TrendingUp className="h-10 w-10 mx-auto text-primary mb-3" />
                      <CardTitle className="text-lg">Looking to Make Extra Cash?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center text-sm">
                        Generate passive income that works while you sleep
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <h4 className="font-semibold text-lg mb-3">How It Works</h4>
                <p className="text-muted-foreground">
                  If you answered yes to any of the above, then a broker deal is what you need. 
                  <strong className="text-foreground"> You get paid for every person that you bring onto the broker.</strong>
                </p>
                <p className="text-muted-foreground mt-3">
                  And we want your clients to win - you get paid for every single trade they take which equals 
                  <strong className="text-primary"> passive income.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="mb-12 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">Use Our Services for Your Business</CardTitle>
              <CardDescription className="text-center text-lg">
                Looking to use our services for your own business or build something similar?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Whether you want to integrate our trading signals into your platform or build a custom solution, 
                  we're here to help you succeed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Get Started Today</CardTitle>
              <CardDescription className="text-center">
                Reach out for broker deals or to use our services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Contact us for any of the 2 options: broker deals or using our services
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex items-center"
                    onClick={() => window.open('https://t.me/khaiwh', '_blank')}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    @khaiwh on Telegram
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex items-center"
                    onClick={() => window.open('mailto:aasakiraltd@gmail.com', '_blank')}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    aasakiraltd@gmail.com
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