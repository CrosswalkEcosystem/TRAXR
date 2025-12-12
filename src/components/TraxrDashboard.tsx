"use client";

import { useMemo, useState } from "react";
import { TraxrScoreResult } from "@/lib/types";
import { TraxrPoolCard } from "./TraxrPoolCard";
import { TraxrTrustMap } from "./TraxrTrustMap";
import { TraxrConsole } from "./TraxrConsole";
import { TraxrLiquidityChart } from "./TraxrLiquidityChart";
import { useCallback } from "react";

type Props = {
  pools: TraxrScoreResult[];
};

// Main TRAXR dashboard; consumes pre-scored pools from cache/endpoint.
export function TraxrDashboard({ pools }: Props) {
  const [query, setQuery] = useState("");
  const sorted = useMemo(
    () => [...pools].sort((a, b) => b.score - a.score),
    [pools],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => {
      const m: any = p.metrics || {};
      const label = poolLabel(p).toLowerCase();
      const fields = [
        p.poolId,
        m.mintA,
        m.mintB,
        m.tokenName,
        m.tokenCode,
        p.tokenName,
        p.tokenCode,
        m.tokenIssuer,
        p.tokenIssuer,
        m.issuer,
      ];
      const metricsText =
        typeof m === "object" && m
          ? JSON.stringify(m)
              .toLowerCase()
              .replace(/[^a-z0-9./:_ -]/g, " ")
          : "";
      const haystack = fields
        .filter((t) => typeof t === "string" && t.trim().length > 0)
        .map((t: string) => t.toLowerCase())
        .join(" ");
      return (
        (p.poolId || "").toLowerCase().includes(q) ||
        `${m.mintA || ""}/${m.mintB || ""}`.toLowerCase().includes(q) ||
        label.includes(q) ||
        haystack.includes(q) ||
        metricsText.includes(q)
      );
    });
  }, [query, sorted]);

  const [selectedPoolId, setSelectedPoolId] = useState(
    () => filtered[0]?.poolId,
  );
  const selected =
    filtered.find((p) => p.poolId === selectedPoolId) || filtered[0];

  function poolLabel(p: TraxrScoreResult) {
    const m: any = p.metrics || {};
    const tokA = tokenDisplay({
      mint: m.mintA,
      tokenName: m.tokenName || p.tokenName,
      tokenCode: m.tokenCode || p.tokenCode,
      issuer: m.tokenIssuer || p.tokenIssuer || m.issuer,
    });
    const tokB = tokenDisplay({
      mint: m.mintB,
      tokenName: m.tokenName || p.tokenName,
      tokenCode: m.tokenCode || p.tokenCode,
      issuer: m.tokenIssuer || p.tokenIssuer || m.issuer,
    });
    return `${tokA}/${tokB}`;
  }

  function tokenDisplay(opts: {
    mint?: string;
    tokenName?: string;
    tokenCode?: string;
    issuer?: string;
  }) {
    const { mint, tokenName, tokenCode } = opts;
    if (!mint || mint === "XRP") return "XRP";
    const issuerFromMint = mint.includes(".") ? mint.split(".")[1] : undefined;
    const issuer = opts.issuer || issuerFromMint;
    const base = tokenName || tokenCode || mint;
    if (!issuer) return base;
    const short = issuer.length > 10 ? `${issuer.slice(0, 4)}...${issuer.slice(-4)}` : issuer;
    return `${base} (${short})`;
  }

  const handleSelect = useCallback(
    (p: TraxrScoreResult) => {
      setSelectedPoolId(p.poolId);
      requestAnimationFrame(() => {
        document
          .getElementById("traxr-selected-card")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [],
  );

  if (!pools.length) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70 backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/70 border-t-transparent" />
        <div className="text-sm text-white/80">Loading TRAXR pools...</div>
        <div className="text-xs text-white/50">
          Run `node scripts/fetch_xrpl_pools.js` to refresh local cache.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:p-6 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-xs uppercase tracking-[0.26em] text-white/60">
            XRPL Pool Scanner
          </div>
          <div className="text-lg text-white">
            Select an existing XRPL pool to view CTS nodes and warnings.
          </div>
          <div className="text-sm text-white/60">
            List is backed by the current TRAXR scan cache (1,000-pool MVP sample). 
            Pools missing will show “Not available”.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:p-6 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-white/60">
              Select Pool
            </div>
            <div className="text-sm text-white/60">
              Token/pool list derived from TRAXR cache
            </div>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pool id or token pair"
            className="w-full rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm text-white outline-none ring-2 ring-transparent focus:border-cyan-400/60 focus:ring-cyan-400/30 lg:max-w-sm"
          />
          <select
            value={selected?.poolId || ""}
            onChange={(e) => setSelectedPoolId(e.target.value)}
            className="w-full rounded-full border border-white/20 bg-gradient-to-r from-[#0f1829] via-[#0c1322] to-[#0a0f1c] px-4 py-2 text-sm text-white outline-none ring-2 ring-transparent focus:border-cyan-400/60 focus:ring-cyan-400/30 shadow-[0_0_18px_rgba(0,255,255,0.15)] lg:max-w-sm"
          >
            {filtered.map((p, idx) => {
              const m: any = p.metrics || {};
              const key =
                p.poolId || `${m.mintA || "A"}-${m.mintB || "B"}-${idx}`;
              const value = p.poolId || key;
              return (
                <option key={key} value={value}>
                  {poolLabel(p)} · CTS {p.ctsNodes}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {selected ? (
        <>
          <div id="traxr-selected-card">
            <TraxrPoolCard pool={selected} />
          </div>
          {/* Interpretation console */}
          <TraxrConsole pool={selected} />
          <TraxrTrustMap pools={filtered} selected={selected} onSelect={handleSelect} />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/90 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-white/60">
                  Liquidity across pools
                </div>
                <div className="text-sm text-white/60">
                  Top pools by XRPL on-ledger liquidity (fits current view)
                </div>
              </div>
            </div>
            <TraxrLiquidityChart pools={filtered} />
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          No pools available in TRAXR cache.
        </div>
      )}
    </div>
  );
}
