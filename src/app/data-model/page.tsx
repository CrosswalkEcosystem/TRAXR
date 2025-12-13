import Image from "next/image";
import BackButton from "@/components/BackButton";
import TraxrDataModelMap from "@/components/TraxrDataModelMap";

export const metadata = {
  title: "TRAXR Data Model — XRPL-Native Structures",
  description:
    "Overview of the XRPL-native data structures and deterministic entities used by TRAXR for pool scoring and risk analysis.",
};

export default function DataModelPage() {
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
                TRAXR · Data Model
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              TRAXR Data Model
            </h1>
            <p className="mt-4 text-slate-400 text-sm tracking-wide">
              XRPL-native entities and deterministic structures used for pool
              analysis and scoring.
            </p>

            {/* OVERVIEW */}
            <section className="mt-12">
              <h2 className="text-lg sm:text-xl font-medium">
                Data Model Overview
              </h2>
              <p className="mt-3 text-slate-300">
                TRAXR operates on a strictly <b>read-only data model</b> derived
                from XRPL ledger state. All entities represent either direct
                on-ledger structures or deterministic transformations of those
                structures.
              </p>
            </section>

            {/* CORE ENTITIES */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Core XRPL Entities
              </h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li>
                  <b>AMM Pool</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Liquidity reserves, fee parameters, pool state, and swap
                    sensitivity derived from XRPL AMM objects.
                  </div>
                </li>
                <li>
                  <b>Issuer</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Issuing account flags, history, and structural trust
                    dependencies within the ledger.
                  </div>
                </li>
                <li>
                  <b>Trustline</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    Supply limits, balances, and issuer relationships that
                    define asset circulation and exposure.
                  </div>
                </li>
                <li>
                  <b>Ledger Snapshot</b>  
                  <div className="text-slate-400 text-sm mt-1">
                    A point-in-time view of XRPL state used as a deterministic
                    scoring baseline.
                  </div>
                </li>
              </ul>
            </section>
            {/* DATA MODEL MAP */}
            <section className="mt-12">
            <h2 className="text-lg sm:text-xl font-medium">
                Deterministic Data Model
            </h2>
            <p className="mt-3 text-slate-300">
                All TRAXR scores are derived from a single XRPL ledger snapshot.
                No predictions, no heuristics — only deterministic state.
            </p>

            <TraxrDataModelMap />
            </section>


            {/* DERIVED METRICS */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Derived Metrics
              </h2>
              <p className="mt-3 text-slate-300">
                From the core entities, TRAXR derives normalized metrics such as
                liquidity depth, relative impact sensitivity, temporal
                stability, and issuer-based trust signals. These metrics are
                composable, auditable, and reproducible.
              </p>
            </section>

            {/* DETERMINISM */}
            <section className="mt-10 rounded-md border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg sm:text-xl font-medium">
                Determinism & Reproducibility
              </h2>
              <p className="mt-3 text-slate-300">
                Given the same ledger snapshot, the TRAXR data model will always
                produce identical derived metrics and scores. No probabilistic
                or non-deterministic inputs are introduced at any stage.
              </p>
            </section>

            {/* MVP MODE */}
            <section className="mt-10 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-5">
              <h2 className="text-base sm:text-lg font-medium text-yellow-300">
                Current MVP Data Model
              </h2>
              <ul className="mt-3 list-disc pl-5 text-slate-300 space-y-1">
                <li>Snapshot-based XRPL data ingestion</li>
                <li>Third-party XRPL data sources for bootstrapping</li>
                <li>Manual refresh cycle (~24h) for validation</li>
                <li>Deterministic scoring over cached state</li>
              </ul>
            </section>

            {/* NATIVE EVOLUTION */}
            <section className="mt-10">
              <h2 className="text-lg sm:text-xl font-medium">
                Evolution to Native Infrastructure
              </h2>
              <p className="mt-3 text-slate-300">
                The target TRAXR data model operates on continuous XRPL indexing
                with automated ingestion, historical replay, and real-time
                metric updates — without altering the core entity definitions.
              </p>
            </section>

            {/* NOTICE */}
            <p className="mt-12 text-xs text-slate-500">
              ℹ️ Data structures are intentionally minimal and XRPL-native to
              preserve long-term compatibility and auditability.
            </p>

            {/* BOTTOM BACK */}
            <div className="mt-14">
              <BackButton />
            </div>

            <p className="mt-8 text-sm text-slate-500">
              Know the data. Know the risk.
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
              href="/architecture"
              className="hover:text-white"
            >
              Architecture
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
