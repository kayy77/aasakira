import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Shield, DollarSign, X, ChevronDown, ChevronUp, Rocket } from 'lucide-react';

const AffiliateBrokerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [isUS, setIsUS] = useState(false);

  useEffect(() => {
    const checkCountryAndShowBanner = async () => {
      if (localStorage.getItem('bannerClosed')) return;
      
      try {
        const res = await fetch('https://ipinfo.io/json');
        const data = await res.json();
        const country = data.country || 'US';
        setIsUS(country === 'US');
        setShowFloatingBanner(true);
      } catch {
        setIsUS(true);
        setShowFloatingBanner(true);
      }
    };

    checkCountryAndShowBanner();
  }, []);

  const handleCloseBanner = () => {
    setShowFloatingBanner(false);
    localStorage.setItem('bannerClosed', 'true');
  };

  if (isDismissed) return null;

  return (
    <>
      <Card className="mb-4 bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border-cyan-400/30 shadow-lg shadow-cyan-500/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Users className="w-5 h-5 text-cyan-300 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-cyan-100">
                  New to trading? Start with our trusted broker partner
                </div>
                {!isCollapsed && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-400">
                      <a 
                        href="https://click.fxlvls.com/goto/track/?campaignid=1000541&affiliateid=10812" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Claim up to 100% deposit bonus
                      </a>
                      {' '}— trusted worldwide
                    </p>
                    <p className="text-xs text-gray-500">
                      *Not available for U.S. clients. 
                      <button 
                        onClick={() => document.getElementById('us-options')?.scrollIntoView()}
                        className="text-cyan-400 hover:text-cyan-300 ml-1"
                      >
                        See U.S. options
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {!isCollapsed && (
                <a
                  href="https://click.fxlvls.com/goto/track/?campaignid=1000541&affiliateid=10812"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Sign Up
                </a>
              )}
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isCollapsed && (
            <div id="us-options" className="mt-4 pt-3 border-t border-gray-700/50">
              <div className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                U.S. Regulated Options
              </div>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://www.forex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-700/30 rounded border border-blue-500/10 hover:border-blue-500/30 transition-colors group text-center"
                >
                  <div className="text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">FOREX.com</div>
                  <div className="text-xs text-gray-500">CFTC</div>
                </a>
                <a
                  href="https://www.oanda.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-700/30 rounded border border-blue-500/10 hover:border-blue-500/30 transition-colors group text-center"
                >
                  <div className="text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">OANDA</div>
                  <div className="text-xs text-gray-500">NFA</div>
                </a>
                <a
                  href="https://www.ig.com/us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-700/30 rounded border border-blue-500/10 hover:border-blue-500/30 transition-colors group text-center"
                >
                  <div className="text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">IG US</div>
                  <div className="text-xs text-gray-500">CFTC/NFA</div>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Banner */}
      {showFloatingBanner && (
        <div className="fixed bottom-0 left-0 w-full bg-blue-600 text-white z-[9999] shadow-xl">
          <div className="flex items-center justify-center p-3 px-6 text-center relative">
            {isUS ? (
              <span className="text-sm">
                Trading from the U.S.? We recommend{' '}
                <a 
                  href="https://www.forex.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-200 underline font-medium"
                >
                  FOREX.com
                </a>
                ,{' '}
                <a 
                  href="https://www.oanda.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-200 underline font-medium"
                >
                  OANDA
                </a>
                , or{' '}
                <a 
                  href="https://www.ig.com/us" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-200 underline font-medium"
                >
                  IG US
                </a>
                .
              </span>
            ) : (
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span className="text-sm">
                  Don't know where to start? We're partnered with{' '}
                  <a 
                    href="https://click.fxlvls.com/goto/track/?campaignid=1000541&affiliateid=10812" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:text-yellow-200 underline font-medium"
                  >
                    our highly recommended broker
                  </a>
                  {' '}with up to <strong>100% deposit bonus</strong>.
                </span>
                <Button
                  onClick={() => window.open('https://click.fxlvls.com/goto/track/?campaignid=1000541&affiliateid=10812', '_blank')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-800 font-bold px-6 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Rocket className="w-4 h-4" />
                  Sign Up Now
                </Button>
              </div>
            )}
            
            <button
              onClick={handleCloseBanner}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AffiliateBrokerBanner;