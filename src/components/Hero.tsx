
import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiStepSignupDialog from './MultiStepSignupDialog';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleExploreTools = () => {
    if (!isAuthenticated) {
      navigate('/education');
    } else {
      navigate('/education');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Subtle background accent */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Heading */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
            Master Trading with{' '}
            <span className="text-primary">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered trading signals and real-time market insights
          </p>
        </div>

        {/* Single Primary CTA */}
        <div className="mb-20 animate-slide-up">
          <MultiStepSignupDialog>
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-12 py-6 text-lg rounded-md"
            >
              Start Trading Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </MultiStepSignupDialog>
          
          <button
            onClick={handleExploreTools}
            className="mt-4 text-muted-foreground hover:text-foreground transition-colors text-sm underline-offset-4 hover:underline"
          >
            Explore AI Tools
          </button>
        </div>

        {/* Community Section */}
        <div className="mt-32 animate-fade-in border-t border-border pt-16">
          <div className="max-w-xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center justify-center gap-3">
              <MessageSquare className="w-6 h-6" />
              Join the Community
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect with traders worldwide and get exclusive market insights
            </p>
            <Button 
              variant="outline"
              size="lg"
              className="border-border hover:bg-accent"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Join Free Telegram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
