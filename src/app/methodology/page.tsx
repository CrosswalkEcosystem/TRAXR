import Image from "next/image";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "How TRAXR Works — Methodology",
  description:
    "Transparent overview of TRAXR scoring, data model, and roadmap to native XRPL infrastructure.",
};

export default function MethodologyPage() {
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
                alt="TRAXR — Trustline Risk Analytics"
                width={140}
                height={140}
                priority
                className="opacity-90"
              />
              <span className="text-xs tracking-wide text-slate-400 sm:text-sm">
                TRAXR · Methodology
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              How TRAXR Works — Methodology
            </h1>
            <p className="mt-4 text-slate-400 text-sm tracking-wide">
              Trustline Risk Analytics eXperience & Reporting
            </p>

            {/* WHAT IT IS */}
            <section className="mt-12">
              <h2 className="text-lg sm:text-xl font-medium">What TRAXR Is</h2>
              <p className="mt-3 text-slate-300">
                TRAXR is a read-only, XRPL-native safety and intelligence layer
                focused on AMM pools, issuers, and trustline structures. It
                evaluates liquidity behavior using deterministic on-ledger data
                — without wallet access, signing, or custody.
              </p>
            </section>

            {/* WHY POOLS */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Why Pools, Not Tokens
              </h2>
              <p className="mt-3 text-slate-300">
                On XRPL, risk does not originate from tokens alone — it emerges
                from where liquidity actually resides. AMM pools encode liquidity
                depth, fee configuration, issuer exposure, trustline structure,
                and real trading behavior.
              </p>
              <p className="mt-3 text-slate-300">
                Token-level scores abstract these dynamics away. TRAXR evaluates
                pools directly, allowing risk to be measured where price impact,
                volatility, and issuer behavior intersect.
              </p>
            </section>

            {/* WHAT IT IS NOT */}
            <section className="mt-10 rounded-md border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg sm:text-xl font-medium">
                What TRAXR Is Not
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-300">
                <li>Not financial or investment advice</li>
                <li>Not a price prediction or yield forecast</li>
                <li>Not a token endorsement or ranking system</li>
              </ul>
            </section>

            {/* SCORE */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                TRAXR Safety Score
              </h2>
              <p className="mt-3 text-slate-300">
                Each XRPL AMM pool receives a Safety Score (0–100), mapped to a
                simplified 0–6 node tier for UX and integrations. Scores are
                relative, temporal, and deterministic.
              </p>
            </section>

            {/* DIMENSIONS */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Scoring Dimensions
              </h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-slate-300">
                <li>
                  <span className="font-medium text-slate-200">
                    Liquidity Depth
                  </span>{" "}
                  — available reserves and resilience
                </li>
                <li>
                  <span className="font-medium text-slate-200">Activity</span> —
                  usage and flow patterns
                </li>
                <li>
                  <span className="font-medium text-slate-200">Impact</span> —
                  sensitivity to swaps
                </li>
                <li>
                  <span className="font-medium text-slate-200">Stability</span> —
                  temporal consistency
                </li>
                <li>
                  <span className="font-medium text-slate-200">Trust</span> —
                  issuer and trustline structure
                </li>
                <li>
                  <span className="font-medium text-slate-200">Fee</span> — pool
                  configuration efficiency
                </li>
              </ul>
            </section>
            {/* STABILITY NOTE */}
            <section className="mt-8 rounded-md border border-cyan-400/20 bg-cyan-400/5 p-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                Stability in MVP Mode
            </h3>
            <p className="mt-2 text-sm text-slate-300">
                Stability reflects temporal consistency of pool behavior.
                In the current MVP phase, <b>Stability is normalized across all pools</b>.
            </p>
            <p className="mt-2 text-sm text-slate-300">
                Volatility-aware stability assessment requires continuous historical
                time-series data, which will be enabled once TRAXR operates on
                native XRPL indexing infrastructure.
            </p>
            </section>


            {/* MVP DATA MODEL */}
            <section className="mt-10 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-5">
              <h2 className="text-base sm:text-lg font-medium text-yellow-300">
                Current MVP Data Model
              </h2>
              <p className="mt-3 text-slate-300">
                The current public MVP operates in a showcase mode. Pool metadata
                is sourced from third-party XRPL data providers and refreshed
                manually approximately every 24 hours.
              </p>
              <p className="mt-2 text-slate-300">
                This approach prioritizes correctness and transparency over
                perceived real-time behavior.
              </p>
            </section>

            {/* ROADMAP */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Roadmap to Native Infrastructure
              </h2>
              <p className="mt-3 text-slate-300">
                TRAXR is designed to remove all third-party dependencies by
                operating a TRAXR-owned XRPL indexer with direct ledger reads,
                automated ingestion, and real-time scoring.
              </p>
            </section>

            {/* MVP NOTICE */}
            <p className="mt-12 text-xs text-slate-500">
              ℹ️ MVP showcase mode — data is refreshed periodically for
              demonstration purposes. Real-time indexing is part of the upcoming
              TRAXR infrastructure rollout.
            </p>

            {/* BOTTOM BACK */}
            <div className="mt-14">
              <BackButton />
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Know Your Pool. Know Your Risk.
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
              href="/architecture"
              className="hover:text-white"
            >
              Architecture
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
            © 2025 Crosswalk Ecosystem LLC. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
}
