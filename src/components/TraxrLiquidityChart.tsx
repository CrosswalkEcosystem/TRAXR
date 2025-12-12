import { TraxrScoreResult } from "@/lib/types";

type Props = {
  pools: TraxrScoreResult[];
};

// Dual-metric bars: Liquidity (depth) + 24h volume (activity), ranked by liquidity.
const tokenDisplay = (opts: {
  mint?: string;
  tokenName?: string;
  tokenCode?: string;
  issuer?: string;
}) => {
  const { mint, tokenName, tokenCode } = opts;
  if (!mint || mint === "XRP") return "XRP";
  const issuerFromMint = mint.includes(".") ? mint.split(".")[1] : undefined;
  const issuer = opts.issuer || issuerFromMint;
  const base = tokenName || tokenCode || mint;
  if (!issuer) return base;
  const short = issuer.length > 10 ? `${issuer.slice(0, 4)}…${issuer.slice(-4)}` : issuer;
  return `${base} (${short})`;
};

const friendlyName = (p: TraxrScoreResult) => {
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
  if (tokA === "XRP") return `XRP/${tokB}`;
  if (tokB === "XRP") return `${tokA}/XRP`;
  return `${tokA}/${tokB}`;
};

export function TraxrLiquidityChart({ pools }: Props) {
  const ranked = [...pools]
    .map((p) => {
      const m: any = p.metrics || {};
      const issuer =
        m.tokenIssuer ||
        (m.mintB && typeof m.mintB === "string" ? m.mintB.split(".")[1] : null) ||
        (p.poolId && p.poolId.includes(".") ? p.poolId.split(".")[1] : null);
      return {
        id: p.poolId || friendlyName(p),
        name: friendlyName(p),
        liq: m.liquidityUsd ?? 0,
        vol24: m.volume24hUsd ?? 0,
        href: issuer ? `https://xrpscan.com/account/${issuer}` : "#",
        cts: p.ctsNodes || Math.max(1, Math.round((p.score ?? 0) / 20)),
      };
    })
    .sort((a, b) => b.liq - a.liq)
    .slice(0, 15);

  const maxLiq = ranked.reduce((m, p) => Math.max(m, p.liq), 0) || 1;
  const maxVol = ranked.reduce((m, p) => Math.max(m, p.vol24), 0) || 1;

  return (
    <div className="w-full space-y-3">
      {ranked.map((p, idx) => {
        const liqPct = Math.max(3, (p.liq / maxLiq) * 100);
        const volPct = Math.max(3, (p.vol24 / maxVol) * 100);
        return (
          <div
            key={p.id || idx}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1626] to-[#0b101c] p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)]"
          >
            <div className="mb-2 flex items-center justify-between text-sm text-white/80">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate pr-2 text-white hover:text-cyan-200 underline-offset-4 hover:underline"
              >
                {p.name}
              </a>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/70">
                <span>
                  Liq {p.liq.toLocaleString("en-US", { maximumFractionDigits: 0 })} XRP
                </span>
                <span>
                  24h Vol {p.vol24.toLocaleString("en-US", { maximumFractionDigits: 0 })} XRP
                </span>

              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-white/5">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(0,255,140,0.4)] transition-[width] duration-500 ease-out"
                  style={{ width: `${liqPct}%` }}
                />
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-amber-300 to-pink-400 shadow-[0_0_10px_rgba(255,180,120,0.4)] transition-[width] duration-500 ease-out"
                  style={{ width: `${volPct}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/60">
                <span>CTS Nodes</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((node) => {
                    const active = node <= (p as any).cts;
                    return (
                      <span
                        key={node}
                        className={`h-3 w-3 rounded-full border ${
                          active
                            ? "border-emerald-300 bg-emerald-400 shadow-[0_0_6px_rgba(0,255,140,0.6)]"
                            : "border-white/20 bg-white/10"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
