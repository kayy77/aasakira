import type { CopyMode } from "./types";

export function computeFollowerVolume(mode: CopyMode, config: any, masterVolume: number, followerBalance: number | null): number {
  switch (mode) {
    case "fixed_lot":
      return Math.max(0.01, Number(config?.lot_size ?? 0.01));
    case "risk_percent": {
      const bal = followerBalance ?? 1000;
      const risk = Number(config?.risk_pct ?? 1) / 100;
      return Math.max(0.01, Math.round(((bal * risk) / 1000) * 100) / 100);
    }
    case "balance_multiplier":
      return Math.max(0.01, masterVolume * Number(config?.multiplier ?? 1));
  }
}