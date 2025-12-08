// Fetch XRPL AMM pools from XRPSCAN only, save to data/xrplPools.json, then enrich with XRPSCAN token metadata.
// Roadmap: replace XRPSCAN dependency with TRAXR-run XRPL indexer to guarantee neutrality for the chain.
// PowerShell example:
//   cd traxr
//   $env:XRPSCAN_URL = "https://api.xrpscan.com/api/v1/amm/pools"
//   $env:XRPSCAN_TOKEN_BASE = "https://api.xrpscan.com/api/v1/token"
//   $env:LIMIT = 200
//   node scripts/fetch_xrpl_pools.js

const fs = require("fs");
const path = require("path");

const XRPSCAN_URL = process.env.XRPSCAN_URL || "https://api.xrpscan.com/api/v1/amm/pools";
const XRPSCAN_TOKEN_BASE =
  process.env.XRPSCAN_TOKEN_BASE || "https://api.xrpscan.com/api/v1/token";
const LIMIT = Number(process.env.LIMIT || 500);
const OUTPUT = path.join(__dirname, "..", "data", "xrplPools.json");

const withTimeout = (p, label) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), 15_000),
    ),
  ]);

const parseCurrency = (a) => {
  if (!a?.currency) return null;
  return a.currency === "XRP" ? "XRP" : `${a.currency}.${a.issuer ?? "unknown"}`;
};

const toFloat = (amt) => {
  if (!amt) return 0;
  if (typeof amt === "string") {
    const num = Number(amt);
    return Number.isFinite(num) ? num / 1_000_000 : 0;
  }
  const num = Number(amt.value);
  return Number.isFinite(num) ? num : 0;
};

async function fetchPoolsFromXrpscan() {
  console.log(`[TRAXR] Fetching pools from XRPSCAN: ${XRPSCAN_URL}`);
  const res = await withTimeout(
    fetch(XRPSCAN_URL, { headers: { Accept: "application/json" } }).then((r) => r.json()),
    "xrpscan-pools",
  );
  if (!Array.isArray(res) || res.length === 0) {
    throw new Error("XRPSCAN returned no pools");
  }
  const pools = [];
  for (const entry of res) {
    const assetA = entry.Asset || entry.asset;
    const assetB = entry.Asset2 || entry.asset2;
    const mintA = parseCurrency(assetA);
    const mintB = parseCurrency(assetB);
    if (!mintA || !mintB) continue;
    const poolId = `${mintA}_${mintB}`;
    pools.push({
      id: poolId,
      mintA,
      mintB,
      issuer: entry.Account || entry.AMMAccount || null,
      reserveA: toFloat(entry.Amount || entry.amount || entry.Balance),
      reserveB: toFloat(entry.Amount2 || entry.amount2),
      tradingFee: entry.TradingFee ?? null,
      lpTokenBalance: entry.LPTokenBalance?.value
        ? Number(entry.LPTokenBalance.value)
        : null,
    });
    if (pools.length >= LIMIT) break;
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(pools, null, 2));
  console.log(`[TRAXR] Saved ${pools.length} pools to ${OUTPUT}`);
  return pools;
}

async function enrichPoolsWithXrpscan(pools) {
  console.log(`[TRAXR] Enriching ${pools.length} pools with XRPSCAN token metadata`);
  const out = [];
  for (const pool of pools) {
    const side = pool.mintA === "XRP" ? pool.mintB : pool.mintA;
    const [code, issuer] = side ? side.split(".") : [];
    if (!code || !issuer) {
      out.push(pool);
      continue;
    }
    try {
      const t = await withTimeout(
        fetch(`${XRPSCAN_TOKEN_BASE}/${code}.${issuer}`, {
          headers: { Accept: "application/json" },
        }).then((r) => r.json()),
        "xrpscan-token",
      );
      out.push({
        ...pool,
        tokenCode: t.code || code,
        tokenIssuer: t.issuer || issuer,
        tokenName: t.meta?.token?.name || t.meta?.issuer?.name || t.code || code,
        tokenPrice: Number(t.price ?? t.metrics?.price ?? 0),
        tokenMarketcap: Number(t.marketcap ?? t.metrics?.marketcap ?? 0),
        tokenSupply: Number(t.supply ?? t.metrics?.supply ?? 0),
        tokenTrustlines: Number(t.metrics?.trustlines ?? 0),
        tokenHolders: Number(t.metrics?.holders ?? 0),
        tokenVolume24h: Number(t.metrics?.volume_24h ?? 0),
        tokenVolume7d: Number(t.metrics?.volume_7d ?? 0),
        tokenExchanges24h: Number(t.metrics?.exchanges_24h ?? 0),
        tokenExchanges7d: Number(t.metrics?.exchanges_7d ?? 0),
        tokenTakers24h: Number(t.metrics?.takers_24h ?? 0),
        tokenTakers7d: Number(t.metrics?.takers_7d ?? 0),
        tokenTrustLevel: t.meta?.token?.trust_level ?? t.meta?.issuer?.trust_level ?? null,
        tokenBlackholed: t.blackholed ?? false,
        issuerVerified: t.IssuingAccount?.verified ?? false,
        tokenUpdatedAt: t.updatedAt || null,
        tokenScore: t.score ?? null,
      });
    } catch (e) {
      console.warn(`Skip ${side}: ${e && e.message ? e.message : e}`);
      out.push(pool);
    }
  }
  console.log("[TRAXR] Enrichment complete.");
  return out;
}

(async () => {
  try {
    const pools = await fetchPoolsFromXrpscan();
    const enriched = await enrichPoolsWithXrpscan(pools);
    fs.writeFileSync(OUTPUT, JSON.stringify(enriched, null, 2));
    console.log("[TRAXR] Saved enriched pools (no scoring in script).");
  } catch (e) {
    console.error("[TRAXR] fetch_xrpl_pools failed", e);
    process.exit(1);
  }
})();
