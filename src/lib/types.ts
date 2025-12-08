// TRAXR node breakdown aligns with CTS dimensions; used by scoring and UI.
export type TraxrNodeBreakdown = {
  depth: number;
  activity: number;
  impact: number;
  stability: number;
  trust: number;
  fee: number;
};

export type XRPLPoolMetrics = {
  poolId: string;
  mintA: string;
  mintB: string;
  issuer?: string;
  tokenName?: string;
  tokenCode?: string;
  tokenIssuer?: string;
  liquidityUsd: number;
  volume24hUsd: number;
  volume7dUsd: number | null;
  tx24h: number;
  tx7d: number | null;
  feePct: number | null;
  volatilityPct: number | null;
  trustlines: number;
  tokenTrustlines?: number;
  blacklisted?: boolean;
  blackholed?: boolean;
  freezeEnabled?: boolean;
  priceImpactPct?: number | null;
  dataAgeHours?: number;
};

export type TraxrScoreResult = {
  poolId: string;
  score: number; // 0-100
  ctsNodes: number; // 1-6
  nodes: TraxrNodeBreakdown;
  warnings: string[];
  updatedAt: string;
  metrics: XRPLPoolMetrics;
  tokenName?: string;
  tokenCode?: string;
  tokenIssuer?: string;
};
