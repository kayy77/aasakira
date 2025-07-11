
import React from 'react';

interface PerformanceStatsProps {
  winRate: number;
  totalSignals: number;
  activeSignals: number;
  avgRR: number;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  winRate,
  totalSignals,
  activeSignals,
  avgRR
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card p-4 text-center hover-glow">
        <div className="text-2xl font-bold text-green-400 mb-1">
          {winRate}%
        </div>
        <div className="text-sm text-gray-400">Win Rate</div>
        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-1 rounded-full" 
            style={{width: `${winRate}%`}}
          ></div>
        </div>
      </div>
      
      <div className="glass-card p-4 text-center hover-glow">
        <div className="text-2xl font-bold text-blue-400 mb-1">
          {totalSignals}
        </div>
        <div className="text-sm text-gray-400">Total Signals</div>
        <div className="text-xs text-blue-300 mt-1">This Month</div>
      </div>
      
      <div className="glass-card p-4 text-center hover-glow">
        <div className="text-2xl font-bold text-purple-400 mb-1">
          {activeSignals}
        </div>
        <div className="text-sm text-gray-400">Active</div>
        <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1 animate-pulse"></div>
      </div>
      
      <div className="glass-card p-4 text-center hover-glow">
        <div className="text-2xl font-bold text-yellow-400 mb-1">
          {avgRR}:1
        </div>
        <div className="text-sm text-gray-400">Avg R:R</div>
        <div className="text-xs text-yellow-300 mt-1">Risk Optimized</div>
      </div>
    </div>
  );
};
