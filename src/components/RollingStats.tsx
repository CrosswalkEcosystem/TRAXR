"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
/* Tooltip (portal-style, fixed)      */
/* ---------------------------------- */

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="cursor-help text-[10px] text-white/40 hover:text-cyan-300">
        ⓘ
      </span>

      <span
        className="
          pointer-events-none absolute
          bottom-full left-1/2
          mb-2 w-56 -translate-x-1/2
          rounded-md border border-white/10
          bg-[#0b1220]/95 px-2 py-1.5
          text-[10px] leading-snug text-white/80
          opacity-0 shadow-lg backdrop-blur
          transition
          group-hover:opacity-100
        "
      >
        {text}
      </span>
    </span>
  );
}




/* ---------------------------------- */
/* Stat bubble                        */
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
            relative isolate
            z-0 hover:z-30
            flex aspect-square w-[72px] sm:w-[84px] md:w-[96px]
            flex-col items-center justify-center gap-1
            rounded-2xl border border-white/10
            bg-white/5 backdrop-blur
            transition
            hover:border-cyan-400/40
            hover:shadow-[0_0_18px_rgba(0,255,255,0.15)]
        "
        >

      <div className="text-lg sm:text-xl font-semibold text-cyan-300 tabular-nums">
        {animated.toLocaleString()}
      </div>

      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60">
        <span>{label}</span>
        <Tooltip text={tooltip} />
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
    <section className="w-full px-2 py-3">
      <div className="flex justify-center gap-3 sm:gap-4">
        <Bubble
          label="Pools"
          value={totalPools}
          tooltip="XRPL AMM pools included in this TRAXR MVP snapshot (sampled subset, not the full network)."
        />
        <Bubble
          label="Signals"
          value={signals}
          tooltip="Pools where TRAXR observed at least one non-informational signal related to liquidity, trading activity, or issuer configuration."
        />
        <Bubble
          label="Elevated"
          value={elevated}
          tooltip="Bottom quartile by TRAXR score within this dataset. This reflects relative positioning, not an absolute risk verdict."
        />
        <Bubble
          label="Issuers"
          value={issuers}
          tooltip="Unique XRPL IOU issuer accounts represented across the sampled pools."
        />
      </div>

      <div className="mt-2 text-center text-[9px] sm:text-[10px] text-white/45">
        Snapshot of ~{totalPools.toLocaleString()} pools · XRPL AMMs &gt; 22k · Relative metrics only
      </div>
    </section>
  );
}
