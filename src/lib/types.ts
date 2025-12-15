// TRAXR node breakdown aligns with CTS dimensions; used by scoring and UI.
export type TraxrNodeBreakdown = {
  depth: number;
  activity: number;
  impact: number;
  stability: number;
  trust: number;
  fee: number;
};

// Core normalized metrics for XRPL AMM pools
export type XRPLPoolMetrics = {
  // ----------------------------------
  // Pool identity
  // ----------------------------------
  poolId: string;
  mintA: string;
  mintB: string;

  // AMM ledger account (pool identity)
  ammAccount?: string;

  // ----------------------------------
  // Token metadata (XRPL IOU semantics)
  // ----------------------------------
  tokenName?: string;
  tokenCode?: string;

  // ✅ REAL XRPL ISSUER (non-XRP only)
  tokenIssuer?: string;

  // ----------------------------------
  // UI + scorer legacy fields
  // (kept for backward compatibility)
  // ----------------------------------

  // NOTE:
  // These are currently XRPL-native (XRP),
  // but UI/scoring still treats them as "Usd".
  // Conversion can be added later without breaking API.
  liquidityUsd: number;
  volume24hUsd: number;
  volume7dUsd: number | null;

  // Activity
  tx24h: number;
  tx7d: number | null;

  // Risk & behavior
  feePct: number | null;
  volatilityPct: number | null;
  trustlines: number;
  tokenTrustlines?: number;

  // Flags
  blacklisted?: boolean;
  blackholed?: boolean;
  freezeEnabled?: boolean;

  // Optional analytics
  priceImpactPct?: number | null;
  dataAgeHours?: number;

  // ----------------------------------
  // XRPL-native truth
  // ----------------------------------

  // Real pool TVL calculated from reserves (XRP)
  tvlXrp?: number | null;

  // Confidence level of TVL calculation
  // realistic = XRP + IOU priced
  // partial    = XRP only
  // unknown    = no reliable data
  tvlLevel?: "realistic" | "partial" | "unknown";

  // Whether token price is considered reliable
  priceConfidence?: boolean;
};

// Scored pool object returned to UI
export type TraxrScoreResult = {
  poolId: string;
  score: number;      // 0–100
  ctsNodes: number;   // 1–6
  nodes: TraxrNodeBreakdown;
  warnings: string[];
  updatedAt: string;

  // Full normalized metrics
  metrics: XRPLPoolMetrics;

  // Convenience duplicates (used by UI/search)
  tokenName?: string;
  tokenCode?: string;
  tokenIssuer?: string;
};
