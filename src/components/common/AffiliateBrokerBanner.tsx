import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Shield, DollarSign, X, ChevronDown, ChevronUp } from 'lucide-react';

const AffiliateBrokerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isDismissed) return null;

  return (
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
                      href="https://aff.fxlvls.com/registration?refAff=10812" 
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
                href="https://aff.fxlvls.com/registration?refAff=10812"
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
  );
};

export default AffiliateBrokerBanner;