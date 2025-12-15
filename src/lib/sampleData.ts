import { XRPLPoolMetrics } from "./types";

export const SAMPLE_POOLS: XRPLPoolMetrics[] = [
  {
    // ----------------------------------
    // Pool identity
    // ----------------------------------
    poolId:
      "XRP_43525950544F0000000000000000000000000000.rRbiKwcueo6MchUpMFDce9XpDwHhRLPFo",
    mintA: "XRP",
    mintB: "CRYPTO",

    // AMM ledger account (pool)
    ammAccount: "rLjUKpwUVmz3vCTmFkXungxwzdoyrWRsFG",

    // ----------------------------------
    // Token-level metadata (XRPL IOU)
    // ----------------------------------
    tokenCode: "CRYPTO",
    tokenName: "CryptoLand",
    tokenIssuer: "rRbiKwcueo6MchUpMFDce9XpDwHhRLPFo",

    // ----------------------------------
    // Legacy UI / scorer fields
    // (XRPL-native values, labelled as USD for now)
    // ----------------------------------
    liquidityUsd: 2_949_601.711352,
    volume24hUsd: 651.710414,
    volume7dUsd: 4_483.408065,

    tx24h: 50,
    tx7d: null,

    feePct: 0.0864, // 864 / 10_000
    volatilityPct: null,

    trustlines: 4_195,

    priceImpactPct: null,
    dataAgeHours: 0.1,

    // ----------------------------------
    // Risk flags
    // ----------------------------------
    blacklisted: false,
    blackholed: true,
    freezeEnabled: false,

    // ----------------------------------
    // XRPL-native truth
    // ----------------------------------
    tvlXrp: 2_949_601.711352,
    tvlLevel: "partial",
    priceConfidence: false,
  },
];
