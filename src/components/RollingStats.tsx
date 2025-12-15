"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------------------------------- */
/* Count-up hook                      */
/* ---------------------------------- */

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

/* ---------------------------------- */
/* Tooltip                            */
/* ---------------------------------- */

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group absolute top-2 right-2 text-[9px] text-white/40">
      ⓘ
      <span className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-white/10 bg-[#0b1220]/95 px-2 py-1.5 text-[10px] text-white/80 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 group-active:opacity-100">
        {text}
      </span>
    </span>
  );
}

/* ---------------------------------- */
/* Signal bubble                      */
/* ---------------------------------- */

function Bubble({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: number;
  tooltip: string;
}) {
  const animated = useCountUp(value);

  return (
    <div
      className="
        relative flex aspect-square w-[72px] sm:w-[84px] md:w-[96px]
        flex-col items-center justify-center gap-1
        rounded-2xl border border-white/10
        bg-white/5 backdrop-blur
        transition hover:border-cyan-400/40
        hover:shadow-[0_0_18px_rgba(0,255,255,0.15)]
      "
    >
      <Tooltip text={tooltip} />

      <div className="text-lg sm:text-xl font-semibold text-cyan-300 tabular-nums">
        {animated.toLocaleString()}
      </div>

      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60">
        {label}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Rolling stats HUD                  */
/* ---------------------------------- */

export function RollingStats({
  pools,
}: {
  pools: {
    warnings?: string[];
    score?: number;
    tokenIssuer?: string;
  }[];
}) {
  const totalPools = pools.length;

  // Relative risk (bottom quartile)
  const scores = useMemo(
    () => pools.map((p) => p.score ?? 100).sort((a, b) => a - b),
    [pools],
  );
  const cutoff = scores[Math.floor(scores.length * 0.25)] ?? 0;

  const elevated = pools.filter(
    (p) => (p.score ?? 100) <= cutoff,
  ).length;

  const signals = pools.filter(
    (p) =>
      (p.warnings ?? []).some(
        (w) => !w.toLowerCase().startsWith("info"),
      ),
  ).length;

  const issuers = new Set(
    pools.map((p) => p.tokenIssuer).filter(Boolean),
  ).size;

  return (
    <section className="w-full overflow-hidden px-2 py-3">
      {/* Bubble row */}
      <div className="flex justify-center gap-3 sm:gap-4">
        <Bubble
          label="Pools"
          value={totalPools}
          tooltip="XRPL AMM pools included in this TRAXR snapshot."
        />
        <Bubble
          label="Signals"
          value={signals}
          tooltip="Pools with non-informational liquidity, activity, or trust signals."
        />
        <Bubble
          label="Elevated"
          value={elevated}
          tooltip="Bottom quartile by TRAXR score within this dataset (relative risk)."
        />
        <Bubble
          label="Issuers"
          value={issuers}
          tooltip="Unique XRPL IOU issuer accounts represented."
        />
      </div>

      {/* Scope line */}
      <div className="mt-2 text-center text-[9px] sm:text-[10px] text-white/45">
        Snapshot of ~{totalPools.toLocaleString()} pools · XRPL AMMs &gt; 22k · Relative metrics
      </div>
    </section>
  );
}
