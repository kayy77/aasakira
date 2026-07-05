export type CopyMode = "fixed_lot" | "risk_percent" | "balance_multiplier";
export type CopyRelationshipStatus = "active" | "paused" | "stopped";
export type CopyEventType = "OPEN" | "MODIFY" | "PARTIAL_CLOSE" | "FULL_CLOSE";
export type CopyJobStatus = "pending" | "processing" | "completed" | "failed" | "rejected";
export type FollowerConnStatus = "connected" | "connecting" | "syncing" | "disconnected" | "error";