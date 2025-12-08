
---

## 📗 `docs/ROADMAP.md`

```markdown
# TRAXR Roadmap

TRAXR is being developed as a long-term, XRPL-native intelligence and safety
layer for liquidity pools, trustlines, and issuers.

This roadmap captures the progression from the current MVP towards a
production-grade indexer and widely adopted ecosystem standard.

---

## Milestone M0 — MVP (Completed)

**Goal:** Prove the end-to-end concept: data → scoring → UI.

Delivered:

- Next.js dashboard at `traxr.vercel.app`.
- JSON-based XRPL AMM pool cache (`data/xrplPools.json`).
- `scripts/fetch_xrpl_pools.js` for:
  - `ledger_data` enumeration,
  - `amm_info` enrichment.
- Private scoring engine package:
  - `@crosswalk.pro/traxr-cts-xrpl`.
- API endpoint:
  - `GET /api/traxr/score`.
- UI components:
  - TRAXR Score + Nodes badge,
  - dimensional breakdown,
  - warnings,
  - liquidity chart,
  - Trust Map and tiering view.

Status: **Complete.**

---

## Milestone M1 — Scoring Engine v1.1 & API Hardening

**Focus:** Robustness, clarity, and integrator experience.

Planned work:

- Refine heuristics and thresholds in the private scoring engine (v1.1).
- Improve fuzzy matching logic and ambiguity handling for pool selection.
- Expand warnings:
  - clearer human-readable descriptions,
  - severity hints,
  - actionable suggestions.
- Stabilize API responses:
  - formal JSON schema for `GET /api/traxr/score`,
  - explicit error codes and validation messages.

Additional endpoints:

- `GET /api/traxr/pools`
  - Returns a paginated list of scored pools.
  - Supports filters: CTS tier, issuer, liquidity brackets, etc.
- `GET /api/traxr/pools/:id`
  - Detailed view for a single pool.

Outcome:

- External integrators (wallets, explorers, DEX UIs) can rely on a stable
  API contract and clear error behavior.

---

## Milestone M2 — XRPL Indexer (Alpha)

**Focus:** TRAXR-owned data infrastructure.

Planned work:

- Implement an XRPL ingestion service that:
  - connects via WebSocket RPC,
  - tracks AMM pool creation and updates,
  - records issuer and trustline metadata.
- Introduce a database backend for:
  - pools and issuers,
  - aggregated trustline stats,
  - basic activity metrics.
- Establish periodic jobs for:
  - pool refresh,
  - consistency checks,
  - snapshot exports (backups).

Outcome:

- TRAXR no longer depends on third-party explorers for core data.
- The scoring model gains access to richer, structured inputs.

---

## Milestone M3 — Indexer v1.0 & Live Alerts

**Focus:** Production-grade infra and live risk signaling.

Planned work:

- Harden indexer deployment:
  - monitoring and logging,
  - backup and recovery strategy,
  - multiple RPC endpoints and failover.
- Design and implement an internal alerting engine that:
  - detects sudden liquidity drops,
  - flags unusual activity or volume spikes,
  - highlights issuer / trustline events relevant to risk.
- Extend API with:
  - `GET /api/traxr/issuer/:address` — issuer-level analytics,
  - `GET /api/traxr/alerts` — list of active risk signals.

Outcome:

- TRAXR becomes a **live safety layer**, not just a static snapshot.
- Ecosystem participants can monitor structural and behavioral changes.

---

## Milestone M4 — Ecosystem Integrations & SDK

**Focus:** Adoption and ease of integration.

Planned work:

- Build a TRAXR JavaScript/TypeScript SDK:
  - simple client for TRAXR endpoints,
  - strongly typed responses,
  - helper functions for widgets.
- Package UI components as reusable widgets:
  - TRAXR Score badge,
  - Trust Map snippet,
  - Warnings panel,
  - Liquidity overview.
- Provide integration guides and examples for:
  - XRPL wallets,
  - DEX frontends,
  - portfolio trackers,
  - analytics dashboards and explorers.

Outcome:

- Any XRPL-related product can plug TRAXR in with **minimal effort**.
- Users see TRAXR’s safety signal directly where they make decisions.

---

## Milestone M5 — Long-Term Operations & Evolution

**Focus:** Sustainability and extended analytics.

Planned work:

- Define and publish SLOs for:
  - uptime,
  - response times,
  - data freshness.
- Optimize infrastructure costs:
  - efficient storage policies,
  - time-series rollups and retention strategies.
- Introduce explicit model versioning:
  - semantic versioning for the scoring engine,
  - changelog and migration notes for integrators.
- Explore extended analytics:
  - more sophisticated volatility windows,
  - anomaly detection (optional ML layer),
  - deeper trustline and issuer behavior insights.

Outcome:

- TRAXR runs as a stable, independent service with a clear roadmap.
- The ecosystem can rely on TRAXR as a **long-term intelligence layer**.

---

## Guiding Principles

Across all milestones, TRAXR is guided by the following principles:

1. **XRPL-First**  
   Built around XRPL’s AMM, trustlines, and issuer model.

2. **Read-Only & Safe by Design**  
   No signing or private key operations. Scoring and analytics only.

3. **Transparent Inputs, Clear Outputs**  
   While the scoring internals are proprietary, the **inputs** and
   **outputs** are documented and auditable.

4. **Modular and Extensible**  
   Designed to support new networks, new metrics, and new use-cases
   without breaking existing integrations.

5. **Ecosystem-Oriented**  
   TRAXR aims to be the shared safety signal for XRPL, not a closed silo.

TRAXR’s endgame is simple:

> **Know Your Pool.**  
> Make informed decisions on XRPL liquidity with a clear, consistent,
> and trustworthy safety signal.
