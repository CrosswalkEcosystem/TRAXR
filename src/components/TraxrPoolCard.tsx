import { TraxrBadge } from "./TraxrBadge";
import { TraxrBreakdown } from "./TraxrBreakdown";
import { TraxrWarnings } from "./TraxrWarnings";
import { TraxrScoreResult } from "@/lib/types";
import Image from "next/image";

type Props = {
  pool: TraxrScoreResult;
};

function band(score: number) {
  if (score >= 80) return "Safe";
  if (score >= 40) return "Medium";
  return "Risky";
}

// TRAXR pool card shows score, CTS nodes, and truthful XRPL-native metrics.
export function TraxrPoolCard({ pool }: Props) {
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

  const isBlackholed = m.tokenBlackholed === true;

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
      <div className="lg:col-span-3 flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 text-xs uppercase tracking-[0.26em] text-white/60">
          TRAXR SCORE
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="truncate whitespace-nowrap text-sm sm:text-base font-semibold text-white">
            {pairLine}
          </div>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            CTS {pool.ctsNodes}
          </span>
        </div>
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

          {/* Volatility placeholder (XRPL-native later) */}
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Volatility
            </div>
            <div className="text-sm sm:text-base font-semibold text-white">
              —
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
