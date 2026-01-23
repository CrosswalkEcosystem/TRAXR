import Image from "next/image";
import BackButton from "@/components/BackButton";
import TraxrArchitectureFlow from "@/components/TraxrArchitectureFlow";


export const metadata = {
  title: "TRAXR Architecture — XRPL-Native Infrastructure",
  description:
    "Technical architecture overview of TRAXR: data ingestion, scoring pipeline, MVP constraints, and roadmap to native XRPL infrastructure.",
};

export default function ArchitecturePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      {/* background grid */}
      <div className="pointer-events-none absolute inset-0 gridlines opacity-40" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 text-white">
        {/* TOP BACK */}
        <BackButton />

        {/* CONTENT CARD */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1220]/90 via-[#0f1f36]/70 to-[#0b0f1d]/80 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,255,255,0.14)]">
          {/* glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,180,255,0.12),transparent_28%)]" />

          <div className="relative mx-auto max-w-4xl">
            {/* HEADER */}
            <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Image
                src="/images/TRAXR.png"
                alt="TRAXR"
                width={120}
                height={120}
                priority
                className="opacity-90"
              />
              <span className="text-xs tracking-wide text-slate-400 sm:text-sm">
                TRAXR · Architecture
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              TRAXR Architecture
            </h1>
            <p className="mt-4 text-slate-400 text-sm tracking-wide">
              XRPL-native data ingestion, deterministic scoring, and progressive
              infrastructure rollout.
            </p>

            {/* OVERVIEW */}
            <section className="mt-12">
              <h2 className="text-lg sm:text-xl font-medium">
                Architectural Overview
              </h2>
              <p className="mt-3 text-slate-300">
                TRAXR is designed as a <b>read-only, deterministic analytics
                system</b> built specifically for XRPL AMM mechanics. The
                architecture prioritizes correctness, reproducibility, and
                incremental rollout over premature real-time complexity.
              </p>
            </section>
            {/* ARCHITECTURE FLOW */}
            <TraxrArchitectureFlow />


            {/* PIPELINE */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Core Data Pipeline
              </h2>

              <ol className="mt-4 space-y-4 text-slate-300 list-decimal pl-5">
                <li>
                  <b>XRPL Data Ingestion</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    AMM pools, trustlines, issuer flags, and ledger metadata are
                    ingested via XRPL-compatible sources.
                  </div>
                </li>

                <li>
                  <b>Normalization Layer</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Raw XRPL data is normalized into deterministic,
                    XRPL-native metrics suitable for scoring.
                  </div>
                </li>

                <li>
                  <b>Scoring Engine</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Pools are evaluated using a multi-dimensional scoring model,
                    producing a stable Safety Score and CTS-style node mapping.
                  </div>
                </li>

                <li>
                  <b>Presentation & Distribution</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Scores are surfaced via dashboard UI and future API
                    endpoints for ecosystem integrations.
                  </div>
                </li>
              </ol>
            </section>

            {/* READ ONLY */}
            <section className="mt-10 rounded-md border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg sm:text-xl font-medium">
                Read-Only by Design
              </h2>
              <p className="mt-3 text-slate-300">
                TRAXR never signs transactions, never interacts with wallets,
                and never custody assets. All components operate in strict
                read-only mode against XRPL data.
              </p>
            </section>

            {/* MVP MODE */}
            <section className="mt-10 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-5">
              <h2 className="text-base sm:text-lg font-medium text-yellow-300">
                Current MVP Architecture
              </h2>
              <ul className="mt-3 list-disc pl-5 text-slate-300 space-y-1">
                <li>Third-party XRPL data sources (bootstrap layer)</li>
                <li>Snapshot-based ingestion (manual refresh)</li>
                <li>Local cache for scoring and UI validation</li>
                <li>No real-time streaming or WebSocket dependency</li>
              </ul>
            </section>

            {/* NATIVE INFRA */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Roadmap to Native XRPL Infrastructure
              </h2>
              <ul className="mt-4 list-disc pl-5 text-slate-300 space-y-2">
                <li>TRAXR-operated XRPL indexer</li>
                <li>Direct ledger reads and subscription-based ingestion</li>
                <li>Automated refresh and historical replay</li>
                <li>Real-time scoring and alert propagation</li>
                <li>Public read-only API for ecosystem integrations</li>
              </ul>
            </section>

            {/* DESIGN PRINCIPLES */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Design Principles
              </h2>
              <ul className="mt-4 space-y-2 text-slate-300">
                <li><b>Determinism over heuristics</b></li>
                <li><b>Infrastructure before UI polish</b></li>
                <li><b>XRPL-native semantics</b></li>
                <li><b>Incremental, auditable rollout</b></li>
              </ul>
            </section>

            {/* NOTICE */}
            <p className="mt-12 text-xs text-slate-500">
              ℹ️ Architecture is introduced incrementally. MVP components are
              intentionally constrained to reduce systemic risk during early
              deployment.
            </p>

            {/* BOTTOM BACK */}
            <div className="mt-14">
              <BackButton />
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Know the system. Know the risk.
            </p>
          </div>
        </section>

        {/* FOOTER */}
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
              href="/methodology"
              className="hover:text-white"
            >
              Methodology
            </a>
            <a
              href="/api-preview"
              className="hover:text-white"
            >
              API (preview)
            </a>
            <a
              href="/data-model"
              className="hover:text-white"
            >
              Data Model
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
            © 2026 Crosswalk Ecosystem LLC. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}

