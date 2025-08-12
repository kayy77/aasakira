// Ultra-fast signal scanner with batch processing and timeouts
import { SignalOrchestrator } from './orchestrator/SignalOrchestrator';

export interface ScanBatch {
  pairs: string[];
  maxProcessingTime: number;
  timeoutPerPair: number;
}

export interface ScanResult {
  signals: any[];
  processed: number;
  skipped: number;
  failed: number;
  totalTime: number;
}

export class OptimizedSignalScanner {
  private static instance: OptimizedSignalScanner;
  private orchestrator = SignalOrchestrator.getInstance();
  private isScanning = false;
  private scanQueue: string[] = [];

  // Batch configuration for different scan types
  private readonly SCAN_CONFIGS = {
    QUICK: { maxPairs: 2, timeoutPerPair: 5000, totalTimeout: 12000 },
    STANDARD: { maxPairs: 3, timeoutPerPair: 7000, totalTimeout: 20000 },
    DEEP: { maxPairs: 4, timeoutPerPair: 10000, totalTimeout: 35000 }
  };

  static getInstance(): OptimizedSignalScanner {
    if (!OptimizedSignalScanner.instance) {
      OptimizedSignalScanner.instance = new OptimizedSignalScanner();
    }
    return OptimizedSignalScanner.instance;
  }

  async performOptimizedScan(scanType: 'QUICK' | 'STANDARD' | 'DEEP' = 'QUICK'): Promise<ScanResult> {
    if (this.isScanning) {
      throw new Error('Scanner already running - wait for completion');
    }

    this.isScanning = true;
    const startTime = Date.now();
    const config = this.SCAN_CONFIGS[scanType];
    
    console.log(`🚀 Starting ${scanType} scan (max ${config.maxPairs} pairs, ${config.totalTimeout}ms total timeout)`);

    try {
      // Early session validation
      const sessionValid = await this.validateSession();
      if (!sessionValid) {
        console.log('⏭️ Skipping scan - poor session conditions');
        return {
          signals: [],
          processed: 0,
          skipped: 1,
          failed: 0,
          totalTime: Date.now() - startTime
        };
      }

      // Get prioritized pairs for scanning
      const pairBatch = this.getPrioritizedPairs(config.maxPairs);
      
      // Process pairs with global timeout
      const scanResult = await this.withGlobalTimeout(
        this.processPairBatch(pairBatch, config.timeoutPerPair),
        config.totalTimeout
      );

      return {
        ...scanResult,
        totalTime: Date.now() - startTime
      };

    } catch (error) {
      console.error(`❌ ${scanType} scan failed:`, error);
      return {
        signals: [],
        processed: 0,
        skipped: 0,
        failed: 1,
        totalTime: Date.now() - startTime
      };
    } finally {
      this.isScanning = false;
    }
  }

  private async validateSession(): Promise<boolean> {
    const hour = new Date().getUTCHours();
    
    // Quick session validation
    const isLondonActive = hour >= 8 && hour <= 17;
    const isNYActive = hour >= 13 && hour <= 22;
    const isAsianActive = hour >= 0 && hour <= 8;
    
    // Reject if no major session is active
    if (!isLondonActive && !isNYActive && !isAsianActive) {
      return false;
    }

    // Reject if it's during the dead zone (22-24 UTC and 6-8 UTC)
    if ((hour >= 22 && hour <= 24) || (hour >= 6 && hour <= 8)) {
      return false;
    }

    return true;
  }

  private getPrioritizedPairs(maxPairs: number): string[] {
    const hour = new Date().getUTCHours();
    
    // Session-based pair prioritization
    let sessionPairs: string[] = [];
    
    if (hour >= 8 && hour <= 17) {
      // London session - EUR/GBP focus
      sessionPairs = ['GBPUSD', 'EURUSD', 'EURGBP', 'XAUUSD'];
    } else if (hour >= 13 && hour <= 22) {
      // NY session - USD strength + indices
      sessionPairs = ['GBPJPY', 'USDJPY', 'EURUSD', 'NAS100'];
    } else if (hour >= 0 && hour <= 8) {
      // Asian session - JPY/AUD focus
      sessionPairs = ['USDJPY', 'AUDUSD', 'NZDUSD', 'EURJPY'];
    } else {
      // Default fallback
      sessionPairs = ['EURUSD', 'GBPUSD', 'USDJPY'];
    }

    return sessionPairs.slice(0, maxPairs);
  }

  private async processPairBatch(pairs: string[], timeoutPerPair: number): Promise<ScanResult> {
    const results = {
      signals: [] as any[],
      processed: 0,
      skipped: 0,
      failed: 0,
      totalTime: 0
    };

    // Process pairs sequentially to avoid overwhelming APIs
    for (const pair of pairs) {
      try {
        console.log(`🔍 Processing ${pair} (timeout: ${timeoutPerPair}ms)`);
        
        const signal = await this.withTimeout(
          this.orchestrator.generateSignal(),
          timeoutPerPair
        );

        if (signal) {
          results.signals.push(signal);
          console.log(`✅ Signal generated for ${pair}`);
        } else {
          results.skipped++;
          console.log(`⏭️ No signal for ${pair}`);
        }
        
        results.processed++;

      } catch (error) {
        console.error(`❌ Failed to process ${pair}:`, error);
        results.failed++;
      }

      // Continue processing all pairs to find best available signal
      // No early break - we want to compare all signals and return the strongest
    }

    return results;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      )
    ]);
  }

  private async withGlobalTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Global timeout after ${ms}ms`)), ms)
      )
    ]);
  }

  // Public method to check if scanner is busy
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  // Emergency stop method
  forceStop(): void {
    this.isScanning = false;
    this.scanQueue = [];
    console.log('🛑 Scanner force stopped');
  }
}

export const optimizedScanner = OptimizedSignalScanner.getInstance();