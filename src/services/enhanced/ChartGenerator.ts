// 📊 CHART GENERATOR - Auto-Generated Marked Charts
// Creates TradingView-style charts with Entry, SL, TP markers

export interface ChartConfig {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  direction: 'BUY' | 'SELL';
  theme: 'light' | 'dark';
  width: number;
  height: number;
  showVolume: boolean;
  showIndicators: boolean;
  markLiquidity: boolean;
  markStructure: boolean;
}

export interface ChartAnnotation {
  type: 'entry' | 'sl' | 'tp' | 'liquidity' | 'structure' | 'text';
  price: number;
  label: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  side?: 'left' | 'right';
}

export interface GeneratedChart {
  url: string;
  config: ChartConfig;
  annotations: ChartAnnotation[];
  metadata: {
    generatedAt: number;
    expiryTime: number;
    riskReward: number;
    pipDistance: {
      sl: number;
      tp: number;
    };
  };
}

export class ChartGenerator {
  private readonly baseUrl = 'https://quickchart.io/chart';
  
  async generateSignalChart(config: ChartConfig): Promise<GeneratedChart> {
    console.log(`📊 Generating chart for ${config.symbol} ${config.direction} signal...`);
    
    try {
      // Create annotations for the signal
      const annotations = this.createSignalAnnotations(config);
      
      // Generate chart URL using QuickChart API
      const chartUrl = await this.buildChartUrl(config, annotations);
      
      // Calculate metadata
      const metadata = this.calculateChartMetadata(config);
      
      console.log(`✅ Chart generated: ${chartUrl.substring(0, 100)}...`);
      
      return {
        url: chartUrl,
        config,
        annotations,
        metadata
      };
      
    } catch (error) {
      console.error('Chart generation error:', error);
      return this.createFallbackChart(config);
    }
  }

  private createSignalAnnotations(config: ChartConfig): ChartAnnotation[] {
    const annotations: ChartAnnotation[] = [];
    
    // Entry point
    annotations.push({
      type: 'entry',
      price: config.entry,
      label: `${config.direction} Entry: ${config.entry.toFixed(5)}`,
      color: config.direction === 'BUY' ? '#00C851' : '#ff4444',
      style: 'solid',
      side: 'right'
    });
    
    // Stop Loss
    annotations.push({
      type: 'sl',
      price: config.stopLoss,
      label: `Stop Loss: ${config.stopLoss.toFixed(5)}`,
      color: '#ff4444',
      style: 'dashed',
      side: 'right'
    });
    
    // Take Profit
    annotations.push({
      type: 'tp',
      price: config.takeProfit,
      label: `Take Profit: ${config.takeProfit.toFixed(5)}`,
      color: '#00C851',
      style: 'dashed',
      side: 'right'
    });
    
    // Add liquidity zones if enabled
    if (config.markLiquidity) {
      annotations.push(...this.generateLiquidityAnnotations(config));
    }
    
    // Add structure markers if enabled
    if (config.markStructure) {
      annotations.push(...this.generateStructureAnnotations(config));
    }
    
    return annotations;
  }

  private generateLiquidityAnnotations(config: ChartConfig): ChartAnnotation[] {
    const annotations: ChartAnnotation[] = [];
    const entry = config.entry;
    
    // Simulate liquidity zones above and below current price
    const liquidityZones = [
      { price: entry + 0.008, label: 'Liquidity Pool', type: 'BUYSIDE' },
      { price: entry - 0.008, label: 'Liquidity Pool', type: 'SELLSIDE' },
      { price: entry + 0.005, label: 'Minor Liquidity', type: 'BUYSIDE' },
      { price: entry - 0.005, label: 'Minor Liquidity', type: 'SELLSIDE' }
    ];
    
    liquidityZones.forEach((zone, index) => {
      annotations.push({
        type: 'liquidity',
        price: zone.price,
        label: zone.label,
        color: zone.type === 'BUYSIDE' ? '#4FC3F7' : '#FF8A65',
        style: 'dotted',
        side: 'left'
      });
    });
    
    return annotations;
  }

  private generateStructureAnnotations(config: ChartConfig): ChartAnnotation[] {
    const annotations: ChartAnnotation[] = [];
    const entry = config.entry;
    
    // Simulate key structure levels
    const structureLevels = [
      { price: entry + 0.012, label: 'Resistance', color: '#ff4444' },
      { price: entry - 0.012, label: 'Support', color: '#00C851' },
      { price: entry + 0.006, label: 'Order Block', color: '#FFB74D' },
      { price: entry - 0.006, label: 'Demand Zone', color: '#81C784' }
    ];
    
    structureLevels.forEach(level => {
      annotations.push({
        type: 'structure',
        price: level.price,
        label: level.label,
        color: level.color,
        style: 'solid',
        side: 'left'
      });
    });
    
    return annotations;
  }

  private async buildChartUrl(config: ChartConfig, annotations: ChartAnnotation[]): Promise<string> {
    // Generate realistic price data for the chart
    const priceData = this.generateRealisticPriceData(config);
    
    const chartConfig = {
      type: 'line',
      data: {
        labels: priceData.timestamps,
        datasets: [{
          label: config.symbol,
          data: priceData.prices,
          borderColor: config.direction === 'BUY' ? '#00C851' : '#ff4444',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: { 
              display: true, 
              text: `Time (${config.timeframe})`,
              color: config.theme === 'dark' ? '#ffffff' : '#333333'
            },
            grid: { 
              color: config.theme === 'dark' ? '#404040' : '#e0e0e0' 
            },
            ticks: {
              color: config.theme === 'dark' ? '#ffffff' : '#333333'
            }
          },
          y: {
            display: true,
            title: { 
              display: true, 
              text: 'Price',
              color: config.theme === 'dark' ? '#ffffff' : '#333333'
            },
            grid: { 
              color: config.theme === 'dark' ? '#404040' : '#e0e0e0' 
            },
            ticks: {
              color: config.theme === 'dark' ? '#ffffff' : '#333333',
              callback: function(value: any) {
                return Number(value).toFixed(5);
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `${config.symbol} ${config.direction} Signal - ${config.timeframe}`,
            color: config.theme === 'dark' ? '#ffffff' : '#333333',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          },
          annotation: {
            annotations: this.convertAnnotationsToChart(annotations, config)
          }
        },
        backgroundColor: config.theme === 'dark' ? '#1e1e1e' : '#ffffff'
      }
    };
    
    // Encode the chart configuration
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    
    // Build QuickChart URL
    const chartUrl = `${this.baseUrl}?c=${encodedConfig}&w=${config.width}&h=${config.height}&f=png&bkg=${config.theme === 'dark' ? '1e1e1e' : 'ffffff'}`;
    
    return chartUrl;
  }

  private generateRealisticPriceData(config: ChartConfig): {
    timestamps: string[];
    prices: number[];
  } {
    const dataPoints = 50; // 50 data points for the chart
    const timestamps: string[] = [];
    const prices: number[] = [];
    
    const basePrice = config.entry;
    const volatility = 0.002; // 20 pips volatility
    
    let currentPrice = basePrice;
    const now = new Date();
    
    // Generate time series based on timeframe
    const timeframeMinutes = this.getTimeframeMinutes(config.timeframe);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * timeframeMinutes * 60 * 1000);
      timestamps.push(timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
      // Generate price movement
      const change = (Math.random() - 0.5) * volatility;
      currentPrice += change;
      
      // Add some trend towards entry price at the end
      if (i < 5) {
        const trendFactor = (5 - i) / 5;
        currentPrice += (basePrice - currentPrice) * trendFactor * 0.3;
      }
      
      prices.push(Number(currentPrice.toFixed(5)));
    }
    
    return { timestamps, prices };
  }

  private convertAnnotationsToChart(annotations: ChartAnnotation[], config: ChartConfig): any[] {
    return annotations.map((annotation, index) => {
      const baseAnnotation = {
        type: 'line',
        scaleID: 'y',
        value: annotation.price,
        borderColor: annotation.color,
        borderWidth: 2,
        borderDash: annotation.style === 'dashed' ? [5, 5] : 
                    annotation.style === 'dotted' ? [2, 2] : [],
        label: {
          enabled: true,
          content: annotation.label,
          position: annotation.side || 'end',
          backgroundColor: annotation.color,
          color: '#ffffff',
          font: { size: 10 }
        }
      };
      
      return baseAnnotation;
    });
  }

  private getTimeframeMinutes(timeframe: string): number {
    const timeframes: Record<string, number> = {
      '1m': 1,
      '5m': 5,
      '15m': 15,
      '1h': 60,
      '4h': 240,
      '1d': 1440
    };
    return timeframes[timeframe] || 15;
  }

  private calculateChartMetadata(config: ChartConfig): GeneratedChart['metadata'] {
    const pipFactor = config.symbol.includes('JPY') ? 100 : 10000;
    
    const slPips = Math.abs(config.entry - config.stopLoss) * pipFactor;
    const tpPips = Math.abs(config.takeProfit - config.entry) * pipFactor;
    const riskReward = tpPips / slPips;
    
    return {
      generatedAt: Date.now(),
      expiryTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      riskReward: Number(riskReward.toFixed(2)),
      pipDistance: {
        sl: Number(slPips.toFixed(1)),
        tp: Number(tpPips.toFixed(1))
      }
    };
  }

  private createFallbackChart(config: ChartConfig): GeneratedChart {
    // Create a simple fallback chart URL
    const fallbackUrl = `${this.baseUrl}?c=${encodeURIComponent(JSON.stringify({
      type: 'line',
      data: {
        labels: ['Error'],
        datasets: [{
          label: 'Chart Generation Failed',
          data: [0],
          borderColor: '#ff4444'
        }]
      }
    }))}&w=${config.width}&h=${config.height}`;
    
    return {
      url: fallbackUrl,
      config,
      annotations: [],
      metadata: {
        generatedAt: Date.now(),
        expiryTime: Date.now() + 3600000, // 1 hour
        riskReward: 0,
        pipDistance: { sl: 0, tp: 0 }
      }
    };
  }

  // Utility methods for different chart types
  async generateComparisonChart(
    signals: Array<{
      symbol: string;
      entry: number;
      direction: 'BUY' | 'SELL';
      confidence: number;
    }>
  ): Promise<string> {
    const chartConfig = {
      type: 'bar',
      data: {
        labels: signals.map(s => s.symbol),
        datasets: [{
          label: 'Signal Confidence',
          data: signals.map(s => s.confidence),
          backgroundColor: signals.map(s => 
            s.direction === 'BUY' ? '#00C851' : '#ff4444'
          )
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Signal Comparison Chart'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Confidence %'
            }
          }
        }
      }
    };
    
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `${this.baseUrl}?c=${encodedConfig}&w=800&h=400&f=png`;
  }

  async generatePerformanceChart(performanceData: {
    dates: string[];
    winRate: number[];
    profitFactor: number[];
  }): Promise<string> {
    const chartConfig = {
      type: 'line',
      data: {
        labels: performanceData.dates,
        datasets: [
          {
            label: 'Win Rate %',
            data: performanceData.winRate,
            borderColor: '#00C851',
            yAxisID: 'y'
          },
          {
            label: 'Profit Factor',
            data: performanceData.profitFactor,
            borderColor: '#4FC3F7',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Signal Performance Over Time'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Win Rate %' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Profit Factor' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    };
    
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `${this.baseUrl}?c=${encodedConfig}&w=800&h=400&f=png`;
  }
}

export const chartGenerator = new ChartGenerator();