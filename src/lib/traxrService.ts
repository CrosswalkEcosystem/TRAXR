import fs from "fs";
import path from "path";

import { SAMPLE_POOLS } from "./sampleData";
import { buildWarnings, toScoreResult } from "./scoringAdapter";
import { TraxrScoreResult, XRPLPoolMetrics } from "./types";

const REFRESH_MS = 5 * 60 * 1000;
const TOP_N = Infinity;

const FALLBACK_SAMPLE = process.env.TRAXR_FALLBACK_SAMPLE === "true";
const LOCAL_POOLS_PATH =
  process.env.TRAXR_LOCAL_POOLS_PATH ||
  path.join(process.cwd(), "data", "xrplPools.json");

// In-memory cache
let cache = new Map<string, TraxrScoreResult>();
let cacheList: TraxrScoreResult[] = [];
let lastRefresh = 0;
let schedulerStarted = false;

const poolKey = (mintA: string, mintB: string) =>
  [mintA.toUpperCase(), mintB.toUpperCase()].sort().join("_");

/* ---------------------------------- */
/* Pool matching (search)              */
/* ---------------------------------- */

function matchesPoolTokens(
  pool: XRPLPoolMetrics,
  tokenA: string,
  tokenB: string,
): boolean {
  const canon = (v?: string) => v?.toUpperCase().trim();
  const split = (v?: string) => {
    if (!v) return [];
    const [code] = v.split(".");
    return [v, code];
  };

  const poolTokens = [
    ...split(canon(pool.mintA)),
    ...split(canon(pool.mintB)),
    canon(pool.tokenCode),
    canon(pool.tokenName),
  ].filter(Boolean) as string[];

  return poolTokens.includes(canon(tokenA)!) &&
         poolTokens.includes(canon(tokenB)!);
}

/* ---------------------------------- */
/* Fetch + cache                       */
/* ---------------------------------- */

async function fetchXRPLPools(): Promise<XRPLPoolMetrics[]> {
  const local = loadLocalPools().map(normalizePool);
  if (local.length) return local.slice(0, TOP_N);

  if (FALLBACK_SAMPLE) {
    console.warn("[TRAXR] Using SAMPLE_POOLS fallback");
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
      updatedAt: p.tokenUpdatedAt || p.updatedAt || new Date().toISOString(),

      // 👇 CRITICAL: pass metrics exactly as normalized
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

/* ---------------------------------- */
/* Public API                          */
/* ---------------------------------- */

export async function ensureTraxrCache() {
  if (!lastRefresh || Date.now() - lastRefresh > REFRESH_MS * 2) {
    try {
      await refreshCache();
    } catch (e) {
      console.error("[TRAXR] cache refresh failed", e);
    }
  }
}

export async function getTraxrScore(
  mintA: string,
  mintB: string,
): Promise<TraxrScoreResult | null> {
  await ensureTraxrCache();

  const exact = cache.get(poolKey(mintA, mintB));
  if (exact) return exact;

  return (
    cacheList.find((p) =>
      matchesPoolTokens(p.metrics, mintA, mintB),
    ) ?? null
  );
}

export async function getTopPools(): Promise<TraxrScoreResult[]> {
  await ensureTraxrCache();
  return cacheList;
}

export function startTraxrScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  setInterval(() => {
    refreshCache().catch((e) =>
      console.error("[TRAXR] background refresh failed", e),
    );
  }, REFRESH_MS);
}

startTraxrScheduler();

/* ---------------------------------- */
/* Local cache loader                  */
/* ---------------------------------- */

function loadLocalPools(): any[] {
  if (!fs.existsSync(LOCAL_POOLS_PATH)) return [];

  try {
    const raw = JSON.parse(fs.readFileSync(LOCAL_POOLS_PATH, "utf8"));
    if (Array.isArray(raw)) {
      console.warn(
        `[TRAXR] Loaded ${raw.length} pools from ${LOCAL_POOLS_PATH}`,
      );
      return raw;
    }
  } catch (e) {
    console.warn("[TRAXR] Failed to load local pools", e);
  }

  return [];
}

/* ---------------------------------- */
/* 🔑 NORMALIZATION (MOST IMPORTANT)   */
/* ---------------------------------- */

function normalizePool(p: any): XRPLPoolMetrics {
  const poolId = p.poolId || p.id || `${p.mintA}_${p.mintB}`;

  // 👉 XRPL-native liquidity (XRP, not USD)
  const liquidityXrp =
    typeof p.tvlXrp === "number" && p.tvlXrp > 0
      ? p.tvlXrp
      : typeof p.reserveA === "number"
        ? p.reserveA
        : 0;

  // 👉 XRPL-native volume
  const volume24hXrp =
    typeof p.tokenVolume24hXrp === "number"
      ? p.tokenVolume24hXrp
      : typeof p.volume24hXrp === "number"
        ? p.volume24hXrp
        : 0;

  const volume7dXrp =
    p.tokenVolume7dXrp ??
    p.volume7dXrp ??
    null;

  return {
    poolId,
    mintA: p.mintA,
    mintB: p.mintB,

    // ✅ pool identity
    ammAccount: p.ammAccount,

    // ✅ token-level metadata
    tokenName: p.tokenName,
    tokenCode: p.tokenCode,
    tokenIssuer: p.tokenIssuer,
    tokenUpdatedAt: p.tokenUpdatedAt || p.updatedAt || null,

    /* ------------------------------- */
    /* Backward-compatible fields     */
    /* ------------------------------- */

    liquidityUsd: liquidityXrp, // XRPL-native, labelled later
    volume24hUsd: volume24hXrp,
    volume7dUsd: volume7dXrp,

    tx24h:
      p.tx24h ??
      p.tokenExchanges24h ??
      p.tokenTakers24h ??
      0,

    tx7d:
      p.tx7d ??
      p.tokenExchanges7d ??
      null,

    feePct:
      typeof p.tradingFee === "number"
        ? p.tradingFee / 10_000
        : null,

    volatilityPct: p.volatilityPct ?? 0,

    trustlines: p.trustlines ?? p.tokenTrustlines ?? 0,

    blackholed: p.blackholed ?? p.tokenBlackholed ?? false,
    blacklisted: p.blacklisted ?? false,
    freezeEnabled: p.freezeEnabled ?? false,

    priceImpactPct: p.priceImpactPct ?? null,
    dataAgeHours: p.dataAgeHours ?? 0,

    /* ------------------------------- */
    /* XRPL-native truth              */
    /* ------------------------------- */

    tvlXrp: p.tvlXrp ?? null,
    tvlLevel: p.tvlLevel ?? "unknown",
    priceConfidence: p.priceConfidence ?? false,
  };
}
