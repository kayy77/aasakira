import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewChartProps {
  symbol?: string;
  width?: string;
  height?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "FX:EURUSD",
  width = "100%",
  height = "400",
  interval = "D",
  theme = "dark",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_chart"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create script element for TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": style,
      "locale": locale,
      "toolbar_bg": toolbar_bg,
      "enable_publishing": enable_publishing,
      "allow_symbol_change": allow_symbol_change,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change]);

  return (
    <Card className="p-0 bg-black/40 border-white/20 overflow-hidden">
      <div 
        ref={containerRef}
        style={{ height: height, width: width }}
        className="tradingview-widget-container"
      >
        <div className="tradingview-widget-container__widget"></div>
        <div className="tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default TradingViewChart;