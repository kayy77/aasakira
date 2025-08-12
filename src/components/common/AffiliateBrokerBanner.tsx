import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Shield, DollarSign } from 'lucide-react';

const AffiliateBrokerBanner: React.FC = () => {
  return (
    <>
      {/* Main Affiliate Banner */}
      <Card className="mb-6 bg-gradient-to-r from-slate-900 via-blue-900/30 to-slate-900 border-cyan-500/30">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-white">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>Don't know where to start?</span>
            </div>
            
            <p className="text-gray-300 text-lg">
              We're partnered with{' '}
              <a 
                href="https://aff.fxlvls.com/registration?refAff=10812" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                our highly recommended broker
              </a>
              {' '}— trusted by our traders worldwide.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span>
                Sign up today and claim up to a <strong className="text-white">100% deposit bonus</strong> to kickstart your trading journey.
              </span>
            </div>
            
            <div className="pt-4">
              <a
                href="https://aff.fxlvls.com/registration?refAff=10812"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 px-8 py-3 rounded-lg font-bold transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Create Your Free Account
              </a>
            </div>
            
            <p className="text-sm text-gray-400 italic pt-2">
              *Note: This broker does not accept U.S. clients. See our{' '}
              <a href="#us-brokers" className="text-cyan-400 hover:text-cyan-300">
                top U.S. broker picks
              </a>
              {' '}if you're in the U.S.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* U.S. Clients Fallback */}
      <Card id="us-brokers" className="mb-6 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 border-blue-500/30">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-xl font-bold text-white">
              <Shield className="w-6 h-6 text-blue-400" />
              <span>Trading from the U.S.?</span>
            </div>
            
            <p className="text-gray-300">
              Unfortunately our partner broker isn't available in your region.
            </p>
            
            <p className="text-gray-400 text-sm">
              Here are our top recommended U.S.-regulated brokers:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <a
                href="https://www.forex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                  🇺🇸 <span className="font-semibold">FOREX.com</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400 mt-1">CFTC Regulated</p>
              </a>
              
              <a
                href="https://www.oanda.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                  🇺🇸 <span className="font-semibold">OANDA</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400 mt-1">NFA Regulated</p>
              </a>
              
              <a
                href="https://www.ig.com/us"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
              >
                <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300">
                  🇺🇸 <span className="font-semibold">IG US</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-400 mt-1">CFTC/NFA Regulated</p>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AffiliateBrokerBanner;