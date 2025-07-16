
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartAnalysis, ChartMarkup } from '@/services/enhancedSignalAnalyzer';

interface MiniChartProps {
  analysis: ChartAnalysis;
  width?: number;
  height?: number;
}

const MiniChart: React.FC<MiniChartProps> = ({ 
  analysis, 
  width = 300, 
  height = 200 
}) => {
  return (
    <Card className="bg-gray-900/50 border border-gray-700/50 p-4">
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded border border-gray-600 flex items-center justify-center relative overflow-hidden"
        style={{ width, height }}
      >
        {/* Simulated Chart Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10" />
        
        {/* Chart Grid */}
        <div className="absolute inset-0">
          {/* Horizontal lines */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-gray-600/30"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
          {/* Vertical lines */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-gray-600/30"
              style={{ left: `${(i + 1) * 16.66}%` }}
            />
          ))}
        </div>

        {/* Simulated Candlesticks */}
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
          {[...Array(8)].map((_, i) => {
            const height = 20 + Math.random() * 60;
            const isGreen = Math.random() > 0.5;
            return (
              <div
                key={i}
                className={`w-2 ${isGreen ? 'bg-green-400' : 'bg-red-400'} opacity-70`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Analysis Overlays */}
        <div className="absolute inset-0 flex flex-col justify-between p-2">
          {/* HTF Bias Indicator */}
          <div className="text-xs">
            <div className={`inline-block px-2 py-1 rounded text-white ${
              analysis.htfBias.aligned ? 'bg-green-500/80' : 'bg-yellow-500/80'
            }`}>
              HTF: {analysis.htfBias.h4Direction.toUpperCase()}
            </div>
          </div>

          {/* Volume Indicator */}
          <div className="text-xs">
            {analysis.volumeDelta.confirmed && (
              <div className="inline-block px-2 py-1 rounded bg-blue-500/80 text-white">
                VOL: {analysis.volumeDelta.strength.toUpperCase()}
              </div>
            )}
          </div>

          {/* Entry Zone Marker */}
          <div className="text-xs">
            {analysis.entryZone.valid && (
              <div className="inline-block px-2 py-1 rounded bg-purple-500/80 text-white">
                {analysis.entryZone.type}
              </div>
            )}
          </div>
        </div>

        {/* Chart Title */}
        <div className="absolute top-2 left-2 text-xs text-gray-400">
          Mini Chart Analysis
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-2 text-xs text-gray-400 space-y-1">
        {analysis.markups.slice(0, 3).map((markup, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span>{markup.description}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MiniChart;
