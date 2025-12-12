// Adapter to load scoring from the private package only.
// Scoring logic lives in @crosswalk.pro/traxr-cts-xrpl.
// Adapter MUST forward pool metrics to UI.

import { TraxrNodeBreakdown, XRPLPoolMetrics } from "./types";

export type TraxrScoreResult = {
  score: number;
  nodes: TraxrNodeBreakdown;
  ctsNodes: number;
  metrics: XRPLPoolMetrics; // 🔥 CRITICAL
};

type WarningFn = (m: XRPLPoolMetrics, n: TraxrNodeBreakdown) => string[];

let toScoreResultFn: (m: XRPLPoolMetrics) => {
  score: number;
  nodes: TraxrNodeBreakdown;
  ctsNodes: number;
};

let buildWarningsFn: WarningFn;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("@crosswalk.pro/traxr-cts-xrpl");
  toScoreResultFn = pkg.toScoreResult;
  buildWarningsFn = pkg.buildWarnings;
} catch {
  throw new Error(
    "Private scorer @crosswalk.pro/traxr-cts-xrpl is missing. Ensure npm auth and dependency are configured."
  );
}

/**
 * Main adapter: compute score + attach raw XRPL metrics.
 */
export const toScoreResult = (m: XRPLPoolMetrics): TraxrScoreResult => {
  const r = toScoreResultFn(m);

  return {
    score: r.score,
    nodes: r.nodes,
    ctsNodes: r.ctsNodes,

    // ✅ PASS-THROUGH (NO TRANSFORM)
    metrics: m,
  };
};

/**
 * Build warnings using scorer logic.
 */
export const buildWarnings = (
  m: XRPLPoolMetrics,
  n: TraxrNodeBreakdown
): string[] => buildWarningsFn(m, n);
