import fs from "fs";
import path from "path";
// TRAXR service: loads cached pools, scores them, and serves API consumers.
// Roadmap: replace bundled JSON with TRAXR-operated XRPL indexer + telemetry (no XRPSCAN).
import { SAMPLE_POOLS } from "./sampleData";
import { buildWarnings, toScoreResult } from "./scoringAdapter";
import { TraxrScoreResult, XRPLPoolMetrics } from "./types";

const REFRESH_MS = 5 * 60 * 1000;
const TOP_N = Infinity; // allow broader set so search covers long-tail tokens (e.g., Noah Walsh)
const OFFLINE_MODE = process.env.TRAXR_OFFLINE === "true";
const FALLBACK_SAMPLE = process.env.TRAXR_FALLBACK_SAMPLE === "true"; // default OFF to force real pools
const LOCAL_POOLS_PATH =
  process.env.TRAXR_LOCAL_POOLS_PATH ||
  path.join(process.cwd(), "data", "xrplPools.json");

// In-memory cache for TRAXR scores (server/runtime only).
let cache = new Map<string, TraxrScoreResult>();
let lastRefresh = 0;
let schedulerStarted = false;
let cacheList: TraxrScoreResult[] = [];

const poolKey = (mintA: string, mintB: string) =>
  [mintA.toUpperCase(), mintB.toUpperCase()].sort().join("_");

function matchesPoolTokens(
  pool: XRPLPoolMetrics,
  tokenA: string,
  tokenB: string,
): boolean {
  const canon = (v: string) => v?.toUpperCase().trim();
  const splitCode = (v: string) => {
    if (!v) return [];
    const upper = canon(v);
    const [code] = upper.split(".");
    return code ? [upper, code] : [upper];
  };
  const a = canon(tokenA);
  const b = canon(tokenB);
  if (!a || !b) return false;
  const poolTokens = [
    ...splitCode(pool.mintA),
    ...splitCode(pool.mintB),
    ...splitCode((pool as any).tokenCode),
    canon((pool as any).tokenName),
  ].filter(Boolean) as string[];
  return poolTokens.includes(a) && poolTokens.includes(b);
}

async function fetchXRPLPools(): Promise<XRPLPoolMetrics[]> {
  const local = loadLocalPools(
    "[TRAXR] Using static XRPL cache (no live fetch at runtime)",
  ).map(normalizePool);
  if (local.length) return local.slice(0, TOP_N);
  if (FALLBACK_SAMPLE) {
    console.warn("[TRAXR] Using sample pools fallback (TRAXR_FALLBACK_SAMPLE=true)");
    return SAMPLE_POOLS.slice(0, TOP_N);
  }
  return [];
}

async function refreshCache() {
  const pools = await fetchXRPLPools();
  const next = new Map<string, TraxrScoreResult>();
  const nextList: TraxrScoreResult[] = [];

  for (const p of pools) {
    const { score, nodes, ctsNodes } = toScoreResult(p);
    const item: TraxrScoreResult = {
      poolId: p.poolId,
      score,
      ctsNodes,
      nodes,
      warnings: buildWarnings(p, nodes),
      updatedAt: new Date().toISOString(),
      metrics: p,
      tokenName: p.tokenName,
      tokenCode: p.tokenCode,
      tokenIssuer: p.tokenIssuer,
    };
    next.set(poolKey(p.mintA, p.mintB), item);
    nextList.push(item);
  }

  cache = next;
  cacheList = nextList.sort((a, b) => b.score - a.score);
  lastRefresh = Date.now();
}

export async function ensureTraxrCache() {
  try {
    if (!lastRefresh) {
      await refreshCache();
    } else if (Date.now() - lastRefresh > REFRESH_MS * 2) {
      await refreshCache();
    }
  } catch (e) {
    console.error("[TRAXR] ensure cache failed", e);
  }
}

export async function getTraxrScore(
  mintA: string,
  mintB: string,
): Promise<TraxrScoreResult | null> {
  await ensureTraxrCache();
  const exact = cache.get(poolKey(mintA, mintB));
  if (exact) return exact;
  // Fuzzy match: allow tokenCode/tokenName instead of raw mint strings.
  const found = cacheList.find((p) => matchesPoolTokens(p.metrics, mintA, mintB));
  return found ?? null;
}

export async function getTopPools(): Promise<TraxrScoreResult[]> {
  await ensureTraxrCache();
  return cacheList;
}

export function startTraxrScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  setInterval(() => {
    refreshCache().catch((e) => console.error("[TRAXR] background refresh failed", e));
  }, REFRESH_MS);
}

// Kick off the scheduler for long-lived runtimes (Next dev/server mode).
startTraxrScheduler();

function loadLocalPools(logMsg?: string): XRPLPoolMetrics[] {
  if (logMsg) console.warn(logMsg);
  if (!fs.existsSync(LOCAL_POOLS_PATH)) return [];
  try {
    const cached = JSON.parse(fs.readFileSync(LOCAL_POOLS_PATH, "utf8"));
    if (Array.isArray(cached) && cached.length) {
      console.warn(
        `[TRAXR] Using local pools cache from ${LOCAL_POOLS_PATH} (${cached.length} entries)`,
      );
      return cached.slice(0, TOP_N) as XRPLPoolMetrics[];
    }
  } catch (e) {
    console.warn("[TRAXR] Failed to load local pools cache", e);
  }
  return [];
}

function normalizePool(p: any): XRPLPoolMetrics {
  const poolId = p.poolId || p.id || `${p.mintA}_${p.mintB}`;
  const liquidityUsd =
    typeof p.liquidityUsd === "number"
      ? p.liquidityUsd
      : (p.reserveA || 0) + (p.reserveB || 0) || (p.tokenMarketcap ? p.tokenMarketcap * 0.01 : 0);
  const volume24h =
    p.volume24hUsd ??
    p.tokenVolume24h ??
    (p.volume24h ? Number(p.volume24h) : 0);
  const volume7d =
    p.volume7dUsd ??
    p.tokenVolume7d ??
    (p.volume7d ? Number(p.volume7d) : null);
  const tx24h =
    p.tx24h ??
    p.tokenExchanges24h ??
    p.tokenTakers24h ??
    (p.exchanges24h ? Number(p.exchanges24h) : 0);
  const tx7d =
    p.tx7d ??
    p.tokenExchanges7d ??
    p.tokenTakers7d ??
    (p.exchanges7d ? Number(p.exchanges7d) : null);
  return {
    poolId,
    mintA: p.mintA,
    mintB: p.mintB,
    issuer: p.issuer,
    tokenName: p.tokenName,
    tokenCode: p.tokenCode,
    tokenIssuer: p.tokenIssuer,
    liquidityUsd: liquidityUsd || 0,
    volume24hUsd: volume24h,
    volume7dUsd: volume7d,
    tx24h: tx24h,
    tx7d: tx7d,
    feePct: p.feePct ?? (p.tradingFee ? p.tradingFee / 10_000 : null),
    volatilityPct: p.volatilityPct ?? 0,
    trustlines: p.trustlines ?? p.tokenTrustlines ?? 0,
    blackholed: p.blackholed ?? p.tokenBlackholed ?? false,
    blacklisted: p.blacklisted ?? false,
    freezeEnabled: p.freezeEnabled ?? false,
    priceImpactPct: p.priceImpactPct ?? null,
    dataAgeHours: p.dataAgeHours ?? 0,
  };
}
