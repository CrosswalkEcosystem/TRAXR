# TRAXR Architecture
---
## 📗 Documentation

- [README](../README.md)
- [ROADMAP](ROADMAP.md)
---
### XRPL-Native Liquidity Intelligence Layer

TRAXR is designed as a modular, extensible, and network-agnostic analytics engine for XRPL liquidity.
It provides real-time and offline scoring, issuer diagnostics, trustline aggregation, and risk
visualization — all without requiring end-users to run any XRPL infrastructure.

This document describes the system architecture, components, data paths, and future expansion points.

---

# 1. High-Level System Overview

TRAXR consists of five cooperating layers:

1. **Client/UI Layer (Next.js)**
2. **API Layer (read-only HTTP endpoints)**
3. **TRAXR Service Layer (pool scoring orchestration)**
4. **Private Scoring Engine (`@crosswalk.pro/traxr-cts-xrpl`)**
5. **Data Pipeline (fetcher → indexer → normalized datasets)**

The design ensures:

- no private keys are used or stored,  
- scoring logic remains proprietary,  
- data sources can evolve from static JSON → live XRPL indexer,  
- external integrators consume TRAXR safely and consistently.

---

# 2. Component Breakdown

## 2.1 Frontend (Next.js)
A real-time interactive dashboard providing:

- pool explorer with fuzzy token search,  
- TRAXR Score (0–100) and TRAXR Nodes (0–6),  
- dimensional breakdown (depth, activity, impact, stability, trust, fee),  
- warnings module and risk heuristics,  
- liquidity charts, trust map, tiering view, and issuer insights.  

The frontend is fully decoupled from the scoring logic — it receives precomputed analytics from the API.

---

## 2.2 API Layer (`/api/traxr/*`)
Read-only endpoints for UI and integrators.

Current endpoints:
- `GET /api/traxr/score?mintA=...&mintB=...`  
- `GET /api/traxr/pools` (upcoming)  
- `GET /api/traxr/pools/:id` (upcoming)  
- `GET /api/traxr/issuer/:address` (roadmap)  
- `GET /api/traxr/alerts` (roadmap)

Responsibilities:
- request validation,
- fuzzy matching and pool resolution,
- caching,
- safe score generation (no write operations),
- standardized error handling.

---

## 2.3 TRAXR Service Layer (`src/lib/traxrService.ts`)
The orchestration core. It:

- loads local datasets (`xrplPools.json`) or future indexer feeds,
- resolves tokens, mints, and issuer codes,
- maps pools to scoring input types (`XRPLPoolMetrics`),
- delegates computation to the private scoring module,
- caches results for performance,
- exposes normalized structures for the API/UI.

Additional logic:
- liquidity tier classification,
- aggregation of pool-level metadata,
- trustline-aware heuristics (roadmap),
- issuer safety modeling (roadmap).

---

## 2.4 Scoring Adapter (`src/lib/scoringAdapter.ts`)
Thin compatibility layer that:

- imports the private scoring engine,
- wraps inputs into strongly typed structures,
- normalizes outputs for UI consumption,
- provides upgrade safety when scoring engine versions change.

This ensures the frontend remains stable even when scoring logic evolves.

---

## 2.5 Private Scoring Engine  
Package: **`@crosswalk.pro/traxr-cts-xrpl`**

Not included in the public repository.

Responsibilities:
- multi-dimensional score computation (0–100 → 0–6 nodes),
- depth/activity/impact/stability/trust/fee modeling,
- issuer-level risk heuristics,
- warnings and anomaly detection,
- future model versioning.

Security considerations:
- no RPC calls,
- no network dependencies,
- deterministic outputs,
- controlled release cycle.

---

# 3. Data Pipeline

Current MVP pipeline is JSON-based for rapid iteration:

XRPL RPC → ledger_data → AMM entries → amm_info enrichment
↓
Normalized dataset → data/xrplPools.json
↓
TRAXR Service → Scoring Engine → UI/API


### 3.1 Fetcher (`scripts/fetch_xrpl_pools.js`)
Implements:

- AMM enumeration via `ledger_data`,
- batching and rate limiting,
- `amm_info` enrichment (reserves, volume, LP stats, fees),
- normalization to UI-friendly floats.

### 3.2 Normalization Goals
- unify token identifiers (`CODE.issuer`),
- derive liquidity and volume in USD,
- attach issuer metadata, flags, and trustline counts (roadmap),
- store structural data for scoring engine.

---

# 4. Data Flow Diagram
```
    XRPL RPC Layer
          │
          ▼
 ┌──────────────────┐
 │ Fetcher Script   │
 │ ledger_data/AMM  │
 └──────────────────┘
          │ JSON
          ▼
 ┌──────────────────┐
 │ Local Dataset    │
 │ xrplPools.json   │
 └──────────────────┘
          │
          ▼
 ┌──────────────────┐
 │ TRAXR Service    │
 │ Matching/Cache   │
 └──────────────────┘
          │
          ▼
 ┌──────────────────┐
 │ Scoring Adapter  │
 │ → Private Engine │
 └──────────────────┘
          │
          ▼
 ┌──────────────────┐
 │ API Layer        │
 └──────────────────┘
          │
          ▼
 ┌──────────────────┐
 │ Frontend UI      │
 └──────────────────┘
``` 
---

# 5. Roadmap Alignment (How Architecture Evolves)

### 5.1 Short Term (M1–M2)
- JSON → hybrid indexer feed  
- richer issuer/trustline fields  
- unified error schema  
- scoring engine upgrade (v1.1)

### 5.2 Medium Term (M3)
- full XRPL indexer  
- live ingestion + WebSocket listeners  
- real-time alerts and anomaly detection  
- deeper trustline analytics

### 5.3 Long Term (M4–M5)
- embeddable TRAXR widgets  
- TRAXR SDK for wallets/explorers  
- formal scoring model versioning (semantic scoring versions)  
- long-term expandability to additional networks (future research)

---

# 6. Security & Safety Model

TRAXR maintains a strictly **read-only** posture:

- no signing  
- no transactions  
- no wallet permissions  
- data-only ingestion  
- deterministic, side-effect-free analytics  

The private scoring engine ensures IP protection while keeping the input/output contract transparent.

---

# 7. Design Principles

1. **XRPL-first, network-agnostic future**
2. **Modular layers with strong isolation**
3. **Deterministic, documented outputs**
4. **Private scoring logic, public scoring rationale**
5. **Indexing independence (zero reliance on third-party explorers)**

---

# 8. Summary

TRAXR is engineered for long-term growth:

- lightweight MVP using JSON caching,  
- scalable path to a production XRPL indexer,  
- safe public APIs for ecosystem integration,  
- strict separation between proprietary scoring and open data structures,  
- extensible framework for future blockchains and analytics layers.

The architecture ensures TRAXR can evolve from a dashboard into the **standard safety signal for XRPL liquidity**.

