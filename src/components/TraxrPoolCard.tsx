import { TraxrBadge } from "./TraxrBadge";
import { TraxrBreakdown } from "./TraxrBreakdown";
import { TraxrWarnings } from "./TraxrWarnings";
import { TraxrScoreResult } from "@/lib/types";
import Image from "next/image";

type Props = {
  pool: TraxrScoreResult;
  onCompare?: () => void;
  onTrend?: () => void;
};

function band(score: number) {
  if (score >= 80) return "Safe";
  if (score >= 40) return "Medium";
  return "Risky";
}

// TRAXR pool card shows score, CTS nodes, and truthful XRPL-native metrics.
export function TraxrPoolCard({ pool, onCompare, onTrend }: Props) {
  const m: any = pool.metrics || pool;

  const nameA = tokenDisplay({
    mint: m.mintA,
    tokenName: m.tokenName,
    tokenCode: m.tokenCode,
    issuer: m.tokenIssuer,
  });

  const nameB = tokenDisplay({
    mint: m.mintB,
    tokenName: m.tokenName,
    tokenCode: m.tokenCode,
    issuer: m.tokenIssuer,
  });

  const pairLine = `${nameA} / ${nameB}`;

  const trustlines = typeof m.trustlines === "number" ? m.trustlines : 0;

  const isBlackholed = m.blackholed === true;

  const tvlXrp = m.tvlXrp ?? null;
  const tvlLevel = m.tvlLevel ?? "unknown";

  const vol24Xrp =
  typeof m.volume24hUsd === "number"
    ? m.volume24hUsd
    : 0;

  const feePct = typeof m.feePct === "number" ? m.feePct : 0;
  const feeDisplay =
  feePct > 0 && feePct < 0.01
    ? "<0.01%"
    : `${feePct.toFixed(4)}%`;



  const issuer =
    m.tokenIssuer ||
    (m.mintB && typeof m.mintB === "string" ? m.mintB.split(".")[1] : null);

  const xrpscanUrl = issuer
    ? `https://xrpscan.com/account/${issuer}`
    : "https://xrpscan.com";

  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:grid-cols-3">
      {/* Header */}
      <div className="lg:col-span-3 flex flex-wrap items-center gap-3 overflow-hidden">
        <div className="shrink-0 text-xs uppercase tracking-[0.26em] text-white/60">
          TRAXR SCORE
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="truncate whitespace-nowrap text-sm sm:text-base font-semibold text-white">
            {pairLine}
          </div>  
        </div>
        {onCompare || onTrend ? (
          <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center gap-2">
            {onTrend ? (
              <button
                type="button"
                onClick={onTrend}
                className="flex-1 sm:flex-none rounded-full border border-amber-400/40 bg-amber-500/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100 shadow-[0_0_14px_rgba(255,200,80,0.2)] transition hover:border-amber-300 hover:text-white"
              >
                Trend
              </button>
            ) : null}
            {onCompare ? (
              <button
                type="button"
                onClick={onCompare}
                className="flex-1 sm:flex-none rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_0_14px_rgba(0,255,255,0.2)] transition hover:border-cyan-300 hover:text-white"
              >
                Compare
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Left column */}
      <div className="space-y-4">
        {/* CTS */}
        <div className="flex items-center justify-start rounded-2xl border border-green/80 px-4 py-4 text-xs uppercase tracking-[0.2em] text-white/60">
          <div className="flex items-center gap-3">
            <Image
              src={`/images/cts${Math.max(1, Math.min(6, pool.ctsNodes))}.png`}
              alt={`CTS ${pool.ctsNodes}`}
              width={112}
              height={112}
              className="h-20 w-20 object-contain drop-shadow-[0_0_22px_rgba(0,255,140,0.45)]"
            />
            <div className="flex flex-col">
              <span className="text-white/70">CTS Nodes</span>
              <span className="text-white text-base font-semibold tracking-[0.18em]">
                {pool.ctsNodes}
              </span>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-3">
          <TraxrBadge score={pool.score} size="sm" />
          <div className="flex flex-col gap-1">
            <a
              href={xrpscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-white hover:text-cyan-200 underline-offset-4 hover:underline"
            >
              View on XRPSCAN
            </a>
            <div className="text-sm text-white/60">
              {band(pool.score)} • Trustlines{" "}
              {trustlines.toLocaleString("en-US")}
            </div>

            {isBlackholed && (
              <div className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100 shadow-[0_0_6px_rgba(0,255,140,0.35)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Blackholed issuer
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
          {/* Liquidity */}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              {tvlLevel === "realistic"
                ? "Liquidity"
                : "Confirmed Liquidity"}
            </div>

            {tvlXrp ? (
              <div className="text-sm sm:text-base font-semibold text-white">
                {tvlXrp.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                XRP
              </div>
            ) : (
              <div className="text-sm text-white/50">Unavailable</div>
            )}

            {tvlLevel === "partial" && (
              <div className="mt-1 text-[10px] text-white/40">
                IOU valuation excluded
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              24h Volume
            </div>
            <div className="text-sm sm:text-base font-semibold text-white">
              {vol24Xrp.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              XRP
            </div>
          </div>

          {/* Fee */}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Fee
            </div>
            <div className="text-sm sm:text-base font-semibold text-white">
              {feeDisplay}
            </div>
          </div>

          {/* Stability / Volatility (MVP disclosure) */}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Stability
              </div>
              <span className="text-[10px] uppercase tracking-wider text-white/30">
                MVP
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
              <span>Max (normalized)</span>

              <span className="group relative inline-flex items-center">
                <span className="cursor-help text-xs text-white/40">ⓘ</span>

                {/* tooltip */}
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-md border border-white/10 bg-black/90 px-3 py-2 text-xs text-slate-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Volatility-based stability is normalized in MVP mode.
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-2">
        <TraxrBreakdown nodes={pool.nodes} />
      </div>

      {/* Warnings */}
      <div className="lg:col-span-3">
        <TraxrWarnings warnings={pool.warnings} />
      </div>
    </div>
  );
}

function tokenDisplay(opts: {
  mint?: string;
  tokenName?: string;
  tokenCode?: string;
  issuer?: string;
}) {
  const { mint, tokenName, tokenCode } = opts;
  if (!mint || mint === "XRP") return "XRP";

  const issuerFromMint = mint.includes(".")
    ? mint.split(".")[1]
    : undefined;

  const issuer = opts.issuer || issuerFromMint;
  const base = tokenName || tokenCode || mint;

  if (!issuer) return base;

  const short =
    issuer.length > 10
      ? `${issuer.slice(0, 4)}...${issuer.slice(-4)}`
      : issuer;

  return `${base} (${short})`;
}
