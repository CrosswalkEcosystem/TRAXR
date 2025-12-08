// Adapter to load scoring from the private package only.
// No fallback: scoring logic must come from @crosswalk.pro/traxr-cts-xrpl.
import { TraxrNodeBreakdown, XRPLPoolMetrics } from "./types";

type ScoreResult = {
  score: number;
  nodes: TraxrNodeBreakdown;
  ctsNodes: number;
};

type WarningFn = (m: XRPLPoolMetrics, n: TraxrNodeBreakdown) => string[];

let toScoreResultFn: (m: XRPLPoolMetrics) => ScoreResult;
let buildWarningsFn: WarningFn;

try {
  // Private scorer package (required).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require("@crosswalk.pro/traxr-cts-xrpl");
  toScoreResultFn = pkg.toScoreResult;
  buildWarningsFn = pkg.buildWarnings;
} catch (e) {
  throw new Error(
    "Private scorer @crosswalk.pro/traxr-cts-xrpl is missing. Ensure npm auth and dependency are configured.",
  );
}

export const toScoreResult = (m: XRPLPoolMetrics): ScoreResult => toScoreResultFn(m);
export const buildWarnings = (m: XRPLPoolMetrics, n: TraxrNodeBreakdown): string[] =>
  buildWarningsFn(m, n);
