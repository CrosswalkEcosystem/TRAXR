"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TraxrDashboard } from "@/components/TraxrDashboard";
import { TraxrScoreResult } from "@/lib/types";

const featureEnabled =
  (process.env.NEXT_PUBLIC_TRAXR_ENABLED ?? "true") === "true";

export default function Home() {
  const [pools, setPools] = useState<TraxrScoreResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPools() {
      setLoading(true);
      setError(null);
      setLogs([
        "[TRAXR] Loading cached XRPL pools (local bundle)...",
        "[TRAXR] Enriching pools...",
        "[TRAXR] Scoring pools...",
      ]);
      try {
        const res = await fetch("/api/traxr/pools", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!isMounted) return;
        setPools(Array.isArray(json) ? json : []);
        setLogs((prev) => [
          ...prev,
          `[TRAXR] Loaded ${Array.isArray(json) ? json.length : 0} pools from cache`,
        ]);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load pools");
        setLogs((prev) => [...prev, `[TRAXR] Error: ${e?.message || e}`]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPools();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 gridlines opacity-40" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 text-white">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220]/90 via-[#0f1f36]/70 to-[#0b0f1d]/80 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,255,255,0.14)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,180,255,0.12),transparent_28%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 lg:w-7/12 xl:w-2/3">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/10 px-2 py-1 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] text-cyan-100 whitespace-nowrap">
                <span className="opacity-80">TRAXR • 
                  <span className="text-blue-400 font-bold">&nbsp;T</span>rustline&nbsp; 
                  <span className="text-blue-400 font-bold">R</span>isk&nbsp;
                  <span className="text-blue-400 font-bold">A</span>nalytics&nbsp;e
                  <span className="text-blue-400 font-bold">X</span>perience&nbsp;&&nbsp;   
                  <span className="text-blue-400 font-bold">R</span>eporting
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                XRPL liquidity, scanned through TRAXR.
              </h1>
              <p className="max-w-2xl text-lg text-white/70">
                TRAXR ingests XRPL AMM pools, trustlines, and issuer flags; maps them to CTS-style
                nodes; then streams risk-aware guidance across tokens and pools.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  XRPSCAN-fed pools (local cache) — roadmap: migrate to TRAXR-owned XRPL infra
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  CTS depth/activity/impact/stability/trust/fee
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Background refresh • 5m
                </span>
              </div>
            </div>
            <div className="flex lg:w-5/12 xl:w-1/3 items-center justify-center lg:justify-end lg:min-h-[320px]">
              <div className="relative h-52 sm:h-64 lg:h-80 xl:h-96 w-full max-w-[640px]">
                <Image
                  src="/images/TRAXR.png"
                  alt="TRAXR"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_0_36px_rgba(0,255,255,0.55)]"
                  sizes="(min-width: 1280px) 640px, (min-width: 1024px) 520px, (min-width: 768px) 420px, 320px"
                />
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/70 border-t-transparent" />
              <div className="text-lg font-semibold">Loading pools...</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs font-mono text-white/70">
              {logs.map((line, idx) => (
                <div key={`${line}-${idx}`}>{line}</div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
            Failed to load pools: {error}
          </div>
        ) : featureEnabled ? (
          <TraxrDashboard pools={pools} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            TRAXR is disabled by flag. Set NEXT_PUBLIC_TRAXR_ENABLED=true to render the XRPL risk
            surface.
          </div>
        )}
        <footer className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/CrosswalkEcosystem/TRAXR"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://crosswalk.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              crosswalk.pro
            </a>
          </div>
          <div className="text-white/50">
            © 2025 Crosswalk Ecosystem LLC. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
