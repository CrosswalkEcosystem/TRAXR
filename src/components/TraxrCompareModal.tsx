"use client";

import { useEffect, useMemo, useState } from "react";
import { TraxrNodeBreakdown, TraxrScoreResult } from "@/lib/types";

type Props = {
  open: boolean;
  pools: TraxrScoreResult[];
  initialLeftId?: string;
  onClose: () => void;
};

type Direction = "higher" | "lower" | "neutral";

const nodeLabels: Record<keyof TraxrNodeBreakdown, string> = {
  depth: "Depth",
  activity: "Activity",
  impact: "Impact",
  stability: "Stability",
  trust: "Trust",
  fee: "Fee",
};

const nodeDescriptions: Record<keyof TraxrNodeBreakdown, string> = {
  depth: "On-ledger liquidity vs. $1k trade",
  activity: "Tx + volume cadence (24h / 7d)",
  impact: "Price impact estimate per hop",
  stability: "Observed volatility vs cap",
  trust: "Issuer risk and trustlines",
  fee: "AMM fee compared to baseline",
};

const formatInt = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatPct = (value: number) => {
  if (value > 0 && value < 0.01) return "<0.01%";
  return `${value.toFixed(4)}%`;
};

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

function pickOther(leftId: string | undefined, pools: TraxrScoreResult[], prefer?: string) {
  if (prefer && prefer !== leftId && pools.some((p) => p.poolId === prefer)) return prefer;
  return pools.find((p) => p.poolId !== leftId)?.poolId;
}

function metricWinner(left: number | null, right: number | null, direction: Direction) {
  if (left === null || right === null) return null;
  if (left === right || direction === "neutral") return null;
  if (direction === "lower") return left < right ? "left" : "right";
  return left > right ? "left" : "right";
}

function MetricRow({
  label,
  left,
  right,
  direction = "higher",
  format = formatInt,
  tooltip,
}: {
  label: string;
  left: number | null;
  right: number | null;
  direction?: Direction;
  format?: (value: number) => string;
  tooltip?: string;
}) {
  const [showTip, setShowTip] = useState(false);
  const winner = metricWinner(left, right, direction);
  const delta = left !== null && right !== null ? left - right : null;
  const deltaText = delta === null ? "n/a" : `${delta >= 0 ? "+" : ""}${format(delta)}`;

  const leftText = left === null ? "n/a" : format(left);
  const rightText = right === null ? "n/a" : format(right);

  let leftFill = 0;
  let rightFill = 0;
  let loserPct: number | null = null;
  if (left !== null && right !== null) {
    if (left === right) {
      leftFill = 100;
      rightFill = 100;
    } else if (direction === "lower") {
      const maxVal = Math.max(left, right);
      leftFill = maxVal > 0 ? (left / maxVal) * 100 : 0;
      rightFill = maxVal > 0 ? (right / maxVal) * 100 : 0;
      if (winner === "left") {
        loserPct = left > 0 ? (right / left) * 100 : null;
      } else if (winner === "right") {
        loserPct = right > 0 ? (left / right) * 100 : null;
      }
    } else {
      const winnerVal = Math.max(left, right);
      const loserVal = Math.min(left, right);
      if (winner === "left") {
        leftFill = 100;
        rightFill = winnerVal > 0 ? (loserVal / winnerVal) * 100 : 0;
        loserPct = winnerVal > 0 ? (loserVal / winnerVal) * 100 : null;
      } else {
        rightFill = 100;
        leftFill = winnerVal > 0 ? (loserVal / winnerVal) * 100 : 0;
        loserPct = winnerVal > 0 ? (loserVal / winnerVal) * 100 : null;
      }
    }
  }

  const leftClass =
    winner === "left"
      ? "border-cyan-300/70 text-cyan-100 ring-1 ring-cyan-300/60 shadow-[0_0_14px_rgba(0,255,255,0.25)]"
      : "border-cyan-400/30 text-cyan-100/80";
  const rightClass =
    winner === "right"
      ? "border-amber-300/70 text-amber-100 ring-1 ring-amber-300/60 shadow-[0_0_14px_rgba(255,200,80,0.25)]"
      : "border-amber-400/30 text-amber-100/80";

  const leftFillClass =
    winner === "left"
      ? "bg-gradient-to-r from-cyan-400/80 to-cyan-200/50"
      : "bg-gradient-to-r from-cyan-500/35 to-cyan-200/20";
  const rightFillClass =
    winner === "right"
      ? "bg-gradient-to-r from-amber-400/80 to-amber-200/50"
      : "bg-gradient-to-r from-amber-500/35 to-amber-200/20";

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 grid-cols-[1fr_auto_1fr]">
      <div className={`relative overflow-hidden rounded-xl border px-3 py-2 text-sm font-semibold ${leftClass}`}>
        <div
          className={`absolute left-0 top-0 h-full ${leftFillClass}`}
          style={{ width: `${Math.max(0, Math.min(100, leftFill))}%` }}
        />
        <div className="relative z-10">{leftText}</div>
        {winner === "right" && loserPct !== null ? (
          <div className="relative z-10 mt-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
            {loserPct.toFixed(2)}% of winner
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-center text-[11px] uppercase tracking-[0.14em] text-white/55">
        <span className="group relative inline-flex flex-col items-center gap-1 text-center">
          <span className="flex items-center justify-center gap-2 max-w-[130px] sm:max-w-none">
            <span className="leading-tight">{label}</span>
            {tooltip ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowTip((prev) => !prev);
                }}
                onBlur={() => setShowTip(false)}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[9px] font-semibold text-white/70"
                aria-label={`Explain ${label}`}
              >
                i
              </button>
            ) : null}
          </span>
          <span className="text-[10px] tracking-[0.16em] text-white/45">
            delta {deltaText}
          </span>
          {tooltip ? (
            <span
              className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-md border border-white/10 bg-black/90 px-3 py-2 text-[11px] normal-case tracking-normal text-slate-200 shadow-lg transition-opacity ${
                showTip ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {tooltip}
            </span>
          ) : null}
        </span>
      </div>
      <div className={`relative overflow-hidden rounded-xl border px-3 py-2 text-sm font-semibold text-right ${rightClass}`}>
        <div
          className={`absolute left-0 top-0 h-full ${rightFillClass}`}
          style={{ width: `${Math.max(0, Math.min(100, rightFill))}%` }}
        />
        <div className="relative z-10">{rightText}</div>
        {winner === "left" && loserPct !== null ? (
          <div className="relative z-10 mt-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
            {loserPct.toFixed(2)}% of winner
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NodeRow({
  label,
  description,
  left,
  right,
  leftName,
  rightName,
  nodeKey,
}: {
  label: string;
  description: string;
  left: number;
  right: number;
  leftName: string;
  rightName: string;
  nodeKey: keyof TraxrNodeBreakdown;
}) {
  const [activeTip, setActiveTip] = useState<"left" | "right" | null>(null);
  const [showStabilityTip, setShowStabilityTip] = useState(false);
  const leftPct = Math.max(0, Math.min(100, left));
  const rightPct = Math.max(0, Math.min(100, right));
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">{label}</div>
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span>{description}</span>
            {nodeKey === "stability" ? (
              <>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  MVP
                </span>
                <span className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowStabilityTip((prev) => !prev);
                    }}
                    onBlur={() => setShowStabilityTip(false)}
                    className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[9px] font-semibold text-white/70"
                    aria-label="Explain stability normalization"
                  >
                    i
                  </button>
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-52 -translate-x-1/2 rounded-md border border-white/10 bg-black/90 px-3 py-2 text-[11px] normal-case tracking-normal text-slate-200 shadow-lg transition-opacity ${
                      showStabilityTip ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Volatility-based stability is normalized in MVP mode.
                  </span>
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveTip((prev) => (prev === "left" ? null : "left"));
              }}
              onBlur={() => setActiveTip(null)}
              className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100"
              aria-label={`Left pool: ${leftName}`}
            >
              L
            </button>
            <span
              className={`pointer-events-none absolute right-0 top-full z-10 mt-2 w-40 rounded-md border border-white/10 bg-black/90 px-3 py-2 text-[11px] normal-case tracking-normal text-slate-200 shadow-lg transition-opacity ${
                activeTip === "left" ? "opacity-100" : "opacity-0"
              }`}
            >
              {leftName}
            </span>
          </span>
          <span className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveTip((prev) => (prev === "right" ? null : "right"));
              }}
              onBlur={() => setActiveTip(null)}
              className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-100"
              aria-label={`Right pool: ${rightName}`}
            >
              R
            </button>
            <span
              className={`pointer-events-none absolute right-0 top-full z-10 mt-2 w-40 rounded-md border border-white/10 bg-black/90 px-3 py-2 text-[11px] normal-case tracking-normal text-slate-200 shadow-lg transition-opacity ${
                activeTip === "right" ? "opacity-100" : "opacity-0"
              }`}
            >
              {rightName}
            </span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Left</span>
            <span>{leftPct}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400/80 to-cyan-200/60"
              style={{ width: `${leftPct}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Right</span>
            <span>{rightPct}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400/80 to-amber-200/60"
              style={{ width: `${rightPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TraxrCompareModal({ open, pools, initialLeftId, onClose }: Props) {
  const poolById = useMemo(
    () => new Map(pools.map((p) => [p.poolId, p])),
    [pools],
  );

  const [leftId, setLeftId] = useState<string | undefined>(
    initialLeftId ?? pools[0]?.poolId,
  );
  const [rightId, setRightId] = useState<string | undefined>(() =>
    pickOther(initialLeftId ?? pools[0]?.poolId, pools),
  );

  useEffect(() => {
    if (!open) return;
    const nextLeft = initialLeftId ?? pools[0]?.poolId;
    setLeftId(nextLeft);
    setRightId((prev) => pickOther(nextLeft, pools, prev));
  }, [open, initialLeftId, pools]);

  if (!open) return null;

  const left = leftId ? poolById.get(leftId) : undefined;
  const right = rightId ? poolById.get(rightId) : undefined;
  const hasChoices = pools.length > 1;

  const leftMetrics: any = left?.metrics || left || {};
  const rightMetrics: any = right?.metrics || right || {};

  const leftLiq = typeof leftMetrics.tvlXrp === "number" ? leftMetrics.tvlXrp : leftMetrics.liquidityUsd ?? null;
  const rightLiq = typeof rightMetrics.tvlXrp === "number" ? rightMetrics.tvlXrp : rightMetrics.liquidityUsd ?? null;

  const leftVol = typeof leftMetrics.volume24hUsd === "number" ? leftMetrics.volume24hUsd : null;
  const rightVol = typeof rightMetrics.volume24hUsd === "number" ? rightMetrics.volume24hUsd : null;

  const leftFee = typeof leftMetrics.feePct === "number" ? leftMetrics.feePct : null;
  const rightFee = typeof rightMetrics.feePct === "number" ? rightMetrics.feePct : null;

  const leftTrust = typeof leftMetrics.trustlines === "number" ? leftMetrics.trustlines : null;
  const rightTrust = typeof rightMetrics.trustlines === "number" ? rightMetrics.trustlines : null;

  const leftWarnings = left?.warnings?.length ?? null;
  const rightWarnings = right?.warnings?.length ?? null;

  const leftName = left ? poolLabel(left) : "Left pool";
  const rightName = right ? poolLabel(right) : "Right pool";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-3 py-6 backdrop-blur sm:items-center">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a101c] via-[#0f172a] to-[#0b1220] shadow-[0_0_40px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Pool Compare</div>
              <div className="text-sm text-white/60">Side-by-side TRAXR snapshot</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 pb-6 pt-4">
          {!hasChoices ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
              Add another pool to compare.
            </div>
          ) : (
            <>
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 grid-cols-[1fr_auto_1fr]">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Left pool</div>
                <select
                  value={leftId || ""}
                  onChange={(e) => {
                    const next = e.target.value;
                    setLeftId(next);
                    setRightId((prev) => pickOther(next, pools, prev));
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  {pools.map((p, idx) => {
                    const key = p.poolId || `${idx}-${p.score}`;
                    return (
                      <option key={key} value={p.poolId} disabled={p.poolId === rightId}>
                        {poolLabel(p)} | CTS {p.ctsNodes}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!leftId || !rightId) return;
                    setLeftId(rightId);
                    setRightId(leftId);
                  }}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 hover:border-white/40 hover:text-white"
                >
                  Swap
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Right pool</div>
                <select
                  value={rightId || ""}
                  onChange={(e) => {
                    const next = e.target.value;
                    setRightId(next);
                    if (next === leftId) {
                      setLeftId(pickOther(next, pools, leftId));
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/60"
                >
                  {pools.map((p, idx) => {
                    const key = p.poolId || `${idx}-${p.score}`;
                    return (
                      <option key={key} value={p.poolId} disabled={p.poolId === leftId}>
                        {poolLabel(p)} | CTS {p.ctsNodes}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-4 shadow-[0_0_20px_rgba(0,255,255,0.12)]">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Left</div>
                <div className="mt-1 truncate text-sm sm:text-lg font-semibold text-white">{leftName}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-2 py-2 shadow-[0_0_14px_rgba(0,255,255,0.18)]">
                    <img
                      src={`/images/cts${Math.max(1, Math.min(6, left?.ctsNodes ?? 1))}.png`}
                      alt={`CTS ${left?.ctsNodes ?? 1}`}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-2 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/80">Score</div>
                    <div className="text-lg sm:text-2xl font-semibold text-cyan-100">{left?.score ?? "n/a"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-2.5 py-2 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">CTS</div>
                    <div className="text-lg sm:text-2xl font-semibold text-white">{left?.ctsNodes ?? "n/a"}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/50">
                  Updated {left?.updatedAt ? new Date(left.updatedAt).toLocaleString() : "n/a"}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  VS
                </div>
              </div>
              <div className="rounded-2xl border border-amber-400/30 bg-black/30 p-4 shadow-[0_0_20px_rgba(255,200,80,0.12)]">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Right</div>
                <div className="mt-1 truncate text-sm sm:text-lg font-semibold text-white">{rightName}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-2 py-2 shadow-[0_0_14px_rgba(255,200,80,0.2)]">
                    <img
                      src={`/images/cts${Math.max(1, Math.min(6, right?.ctsNodes ?? 1))}.png`}
                      alt={`CTS ${right?.ctsNodes ?? 1}`}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-2 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/80">Score</div>
                    <div className="text-lg sm:text-2xl font-semibold text-amber-100">{right?.score ?? "n/a"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-2.5 py-2 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">CTS</div>
                    <div className="text-lg sm:text-2xl font-semibold text-white">{right?.ctsNodes ?? "n/a"}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/50">
                  Updated {right?.updatedAt ? new Date(right.updatedAt).toLocaleString() : "n/a"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <MetricRow
                label="Liquidity (XRP)"
                left={leftLiq}
                right={rightLiq}
                tooltip="Total liquidity in the pool, XRPL-native (XRP + priced IOU when available)."
              />
              <MetricRow
                label="24h Volume (XRP)"
                left={leftVol}
                right={rightVol}
                tooltip="Total swap volume in the last 24 hours, XRPL-native XRP units."
              />
              <MetricRow
                label="Fee"
                left={leftFee}
                right={rightFee}
                direction="lower"
                format={formatPct}
                tooltip="AMM trading fee percentage (lower is cheaper)."
              />
              <MetricRow
                label="Trustlines"
                left={leftTrust}
                right={rightTrust}
                tooltip="Count of trustlines connected to the issuer."
              />
              <MetricRow
                label="Warnings"
                left={leftWarnings}
                right={rightWarnings}
                direction="lower"
                tooltip="Number of risk warnings triggered by CTS signals."
              />
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.26em] text-white/60">
                <span>TRAXR Nodes</span>
                <span>0 - 100</span>
              </div>
              <div className="grid gap-3">
                    {Object.entries(nodeLabels).map(([key, label]) => {
                      const leftVal = left?.nodes?.[key as keyof TraxrNodeBreakdown] ?? 0;
                      const rightVal = right?.nodes?.[key as keyof TraxrNodeBreakdown] ?? 0;
                      return (
                        <NodeRow
                          key={key}
                          label={label}
                          description={nodeDescriptions[key as keyof TraxrNodeBreakdown]}
                          left={leftVal}
                          right={rightVal}
                          leftName={leftName}
                          rightName={rightName}
                          nodeKey={key as keyof TraxrNodeBreakdown}
                        />
                      );
                    })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
