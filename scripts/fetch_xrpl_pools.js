const fs = require("fs");
const path = require("path");

const XRPSCAN_POOLS =
  process.env.XRPSCAN_URL || "https://api.xrpscan.com/api/v1/amm/pools";
const XRPSCAN_TOKEN =
  process.env.XRPSCAN_TOKEN_BASE || "https://api.xrpscan.com/api/v1/token";
const XRPSCAN_AMM =
  process.env.XRPSCAN_AMM_BASE || "https://api.xrpscan.com/api/v1/amm";

const LIMIT = Number(process.env.LIMIT || 500);
const OUTPUT_DIR = path.join(__dirname, "..", "data");

function timestampSlug() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getUTCFullYear();
  const mm = pad(now.getUTCMonth() + 1);
  const dd = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const min = pad(now.getUTCMinutes());
  const ss = pad(now.getUTCSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}Z`;
}

const withTimeout = (p, label) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), 15_000)
    ),
  ]);

const parseCurrency = (a) => {
  if (!a?.currency) return null;
  return a.currency === "XRP"
    ? "XRP"
    : `${a.currency}.${a.issuer ?? "unknown"}`;
};

const toFloat = (amt) => {
  if (!amt) return 0;
  if (typeof amt === "string") {
    const n = Number(amt);
    return Number.isFinite(n) ? n / 1_000_000 : 0;
  }
  const n = Number(amt.value);
  return Number.isFinite(n) ? n : 0;
};

async function fetchAmmInfo(account) {
  const data = await withTimeout(
    fetch(`${XRPSCAN_AMM}/${account}`, {
      headers: { Accept: "application/json" },
    }).then((r) => r.json()),
    "xrpscan-amm-info"
  );

  return {
    reserveXrp: toFloat(data.amount),
    reserveIou: toFloat(data.amount2),
  };
}

async function fetchPools() {
  console.log("[TRAXR] Fetching AMM pools");
  const res = await withTimeout(
    fetch(XRPSCAN_POOLS, { headers: { Accept: "application/json" } }).then((r) =>
      r.json()
    ),
    "xrpscan-pools"
  );

  const pools = [];

  for (const entry of res) {
    const assetA = entry.Asset || entry.asset;
    const assetB = entry.Asset2 || entry.asset2;

    const mintA = parseCurrency(assetA);
    const mintB = parseCurrency(assetB);
    if (!mintA || !mintB) continue;

    const ammAccount = entry.Account || entry.AMMAccount || null;

    pools.push({
      id: `${mintA}_${mintB}`,

      // ✅ Pool identity (AMM account)
      ammAccount,

      // ❗ DO NOT store "issuer" here — AMM ≠ issuer

      mintA,
      mintB,

      reserveA: toFloat(entry.Amount || entry.amount || entry.Balance),
      reserveB: toFloat(entry.Amount2 || entry.amount2),

      tradingFee: entry.TradingFee ?? null,
      lpTokenBalance: entry.LPTokenBalance?.value
        ? Number(entry.LPTokenBalance.value)
        : null,
    });

    if (pools.length >= LIMIT) break;
  }

  return pools;
}

async function enrichPools(pools) {
  console.log("[TRAXR] Enriching pools with token data + amm_info");
  const out = [];

  for (const pool of pools) {
    const side = pool.mintA === "XRP" ? pool.mintB : pool.mintA;
    const [code, issuer] = side.split(".");

    let reserveA = pool.reserveA;
    let reserveB = pool.reserveB;

    // 🔹 On-ledger reserve fallback
    if (reserveA === 0 && reserveB === 0 && pool.ammAccount) {
      try {
        const r = await fetchAmmInfo(pool.ammAccount);
        if (pool.mintA === "XRP") {
          reserveA = r.reserveXrp;
          reserveB = r.reserveIou;
        } else {
          reserveA = r.reserveIou;
          reserveB = r.reserveXrp;
        }
      } catch {}
    }

    let tokenMeta = {};
    let tokenPriceXrp = 0;

    try {
      const t = await withTimeout(
        fetch(`${XRPSCAN_TOKEN}/${code}.${issuer}`, {
          headers: { Accept: "application/json" },
        }).then((r) => r.json()),
        "xrpscan-token"
      );

      tokenPriceXrp = Number(t.price ?? t.metrics?.price ?? 0);

      tokenMeta = {
        tokenCode: t.code || code,

        // ✅ REAL XRPL ISSUER
        tokenIssuer: t.issuer || issuer,

        tokenName:
          t.meta?.token?.name ||
          t.meta?.issuer?.name ||
          t.code ||
          code,

        tokenPriceXrp,
        tokenSupply: Number(t.supply ?? t.metrics?.supply ?? 0),
        tokenMarketcapXrp: Number(
          t.marketcap ?? t.metrics?.marketcap ?? 0
        ),

        tokenTrustlines: Number(t.metrics?.trustlines ?? 0),
        tokenHolders: Number(t.metrics?.holders ?? 0),
        tokenVolume24hXrp: Number(t.metrics?.volume_24h ?? 0),
        tokenVolume7dXrp: Number(t.metrics?.volume_7d ?? 0),
        tokenExchanges24h: Number(t.metrics?.exchanges_24h ?? 0),
        tokenTakers24h: Number(t.metrics?.takers_24h ?? 0),

        tokenTrustLevel:
          t.meta?.token?.trust_level ??
          t.meta?.issuer?.trust_level ??
          null,

        tokenBlackholed: t.blackholed ?? false,
        issuerVerified: t.IssuingAccount?.verified ?? false,
        tokenUpdatedAt: t.updatedAt || null,
        tokenScore: t.score ?? null,
      };
    } catch {}

    const xrpReserve =
      pool.mintA === "XRP" ? reserveA : reserveB;
    const iouReserve =
      pool.mintA === "XRP" ? reserveB : reserveA;

    // 🔒 Price confidence
    const priceConfidence =
      tokenPriceXrp > 0 &&
      (
        tokenMeta.tokenVolume24hXrp >= 1000 ||
        tokenMeta.tokenTakers24h >= 25 ||
        tokenMeta.tokenExchanges24h >= 100
      );

    let tvlXrp = null;
    let tvlLevel = "unknown";

    if (xrpReserve > 0 && priceConfidence) {
      tvlXrp = xrpReserve + iouReserve * tokenPriceXrp;
      tvlLevel = "realistic";
    } else if (xrpReserve > 0) {
      tvlXrp = xrpReserve;
      tvlLevel = "partial";
    }

    out.push({
      ...pool,
      reserveA,
      reserveB,
      ...tokenMeta,
      tvlXrp,
      tvlLevel,
      priceConfidence,
    });
  }

  return out;
}

(async () => {
  try {
    const pools = await fetchPools();
    const enriched = await enrichPools(pools);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outputFile = path.join(
      OUTPUT_DIR,
      `xrplPools_${timestampSlug()}.json`,
    );
    fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));

    console.log(`[TRAXR] Saved ${enriched.length} final pools -> ${outputFile}`);
  } catch (e) {
    console.error("[TRAXR] fetch failed", e);
    process.exit(1);
  }
})();
