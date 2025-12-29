# TRAXR - Trustline Risk Analytics eXperience & Reporting
### Know Your Pool.

![Status](https://img.shields.io/badge/status-MVP-blue)
![XRPL](https://img.shields.io/badge/network-XRPL-black)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Scoring](https://img.shields.io/badge/scoring-private-orange)

## 📗 Documentation

- [ROADMAP](docs/ROADMAP.md)
- [ARCHITECTURE](docs/ARCHITECTURE.md)

---

TRAXR is an intelligence and risk-assessment layer for XRPL liquidity.
All metrics are derived directly from XRPL on-ledger data and expressed in XRPL-native units unless explicitly noted otherwise.
It evaluates AMM pools, trustlines, issuers, and market behavior to generate 
a unified TRAXR Safety Score (0–100 → 0–6 Nodes). 
The scoring model is modular, versioned, and designed to evolve as TRAXR’s 
dedicated XRPL indexer matures.

The UI and API are reusable for XRPL wallets, explorers, DEX UIs, and analytics dashboards. Roadmap: operate TRAXR-owned XRPL AMM and trustline indexer (no XRPSCAN dependency) and present to the XRPL Foundation for grant consideration.

Scoring is delivered by a private npm package (`@crosswalk.pro/traxr-cts-xrpl`) so the CTS logic stays private; the app consumes that package via `src/lib/scoringAdapter.ts`.

---

## Quickstart
```
npm install
npm run dev
# http://localhost:3000
```

---

## Environment configuration

### Private scoring package
- Add an `.npmrc` (or set env) with `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`.
- Ensure your npm user has access to `@crosswalk.pro/traxr-cts-xrpl`.

### Core flags
- `NEXT_PUBLIC_TRAXR_ENABLED=true|false` - toggle TRAXR UI.
- `TRAXR_OFFLINE=true` — run TRAXR in offline mode using local datasets.
- `TRAXR_FALLBACK_SAMPLE=true` — load an embedded sample dataset for testing and demos.
- `TRAXR_LOCAL_POOLS_PATH` - path to XRPL pool JSON (default: newest `data/xrplPools_*.json`, fallback `data/xrplPools.json`).
- `TRAXR_FETCH_TIMEOUT_MS` - timeout for XRPL RPC calls (default `10000`).

### Fetch-script flags (`scripts/fetch_xrpl_pools.js`)
- `XRPL_RPC_URL` - WebSocket endpoints (default `wss://xrplcluster.com,wss://s2.ripple.com,wss://xrpl.ws,wss://s1.ripple.com`).
- `LIMIT` - max pools to save (default `200`).
- `MAX_INFO` - max pools enriched with `amm_info` (default `60`).
- `TIMEOUT_MS` - request timeout (default `10000`).
- `AMM_INFO_DELAY_MS` - delay between `amm_info` calls (default `150` ms).

---

## Fetch XRPL AMM pools to JSON (dev flow)
The fetcher discovers AMM ledger entries via `ledger_data`, enriches them with `amm_info` (reserves, fee, LP info), and writes normalized output to `data/xrplPools_YYYYMMDD_HHmmssZ.json` (timestamped). The UI will automatically load the newest snapshot unless `TRAXR_LOCAL_POOLS_PATH` is set.

All liquidity and volume values are XRPL-native (XRP-denominated).  
Fields may retain legacy `*Usd` naming for backward compatibility in the UI layer; no USD valuation is assumed unless explicitly stated.


Run:
```
# optional override: XRPL_RPC_URL=wss://s2.ripple.com
XRPL_RPC_URL=wss://xrplcluster.com node scripts/fetch_xrpl_pools.js
```

Why JSON?
JSON-based data is a temporary bootstrap layer.  
It enables rapid iteration while the dedicated TRAXR indexer (AMM + Trustlines + Issuers) 
is under development. The fetch script is intentionally throttled and will be replaced 
by TRAXR-owned infrastructure.

---

## TRAXR scoring API (read-only engine)
Fuzzy matching works on mintA/mintB, token codes, and token names (mint strings like `CODE.issuer` are accepted).

Example:
```
GET http://localhost:3000/api/traxr/score?mintA=XRP&mintB=RLUSD
```
or with full mint:
```
GET http://localhost:3000/api/traxr/score?mintA=XRP&mintB=524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De
```

Response includes:
- pool ID
- TRAXR Score (0-100) and TRAXR Nodes (0-6)
- dimension breakdown: depth, activity, impact, stability, trust, fee
- warnings and raw XRPL-native metrics used for computation (liquidity, volume, trustlines, fees)


Upcoming endpoints (roadmap):
- `GET /api/traxr/pools`
- `GET /api/traxr/pools/:id`
- `GET /api/traxr/issuer/:address`
- `GET /api/traxr/alerts`

---

## Architecture
- `@crosswalk.pro/traxr-cts-xrpl` (private) – CTS-XRPL scoring engine (multi-dimensional scoring model covering liquidity characteristics, market behavior, issuer signals, trustline structure, and fee dynamics + warnings).
- `src/lib/scoringAdapter.ts` – thin wrapper to call the private package.
- `src/lib/traxrService.ts` – loads local XRPL pool data, caches and scores pools (uses the private scorer), fuzzy matcher for tokens/pools.
- `src/app/api/traxr/*` - read-only HTTP surface for TRAXR consumers.
- `src/components/*` - TRAXR badge, breakdown, trust map, liquidity visualization, warnings, pool comparison modal.
- `scripts/fetch_xrpl_pools.js` - safe pool enumeration -> amm_info enrichment -> XRPL-native JSON export (bootstrap layer).


---

## Why TRAXR matters (XRPL impact)
1) Independent XRPL data infra: roadmap to drop XRPSCAN reliance.  
2) Standardized safety score for XRPL (CTS-XRP) that wallets, DEX, and explorers can adopt.  
3) Reusable analytics layer: TRAXR adds insight, not enforcement.  
4) Transparency: clear scoring rationale, visible dimensional breakdown, and explicit XRPL-native data assumptions. 
5) Embeddable widgets: badge, trust map, liquidity view, issuer/trustline diagnostics.

---

## Vision
- The intelligence layer for XRPL liquidity.  
- A shared safety standard for the ecosystem.  
- Trustline-aware, volatility-aware, issuer-aware.  
- Know Your Pool.



                               
```
                                                  
 mmmmmmmm  mmmmmm       mm     mmm  mmm  mmmmmm   
 """##"""  ##""""##    ####     ##mm##   ##""""## 
    ##     ##    ##    ####      ####    ##    ## 
    ##     #######    ##  ##      ##     #######  
    ##     ##  "##m   ######     ####    ##  "##m 
    ##     ##    ##  m##  ##m   ##  ##   ##    ## 
    ""     ""    """ ""    ""  """  """  ""    """
                            
``` 
## Status
TRAXR is currently in active MVP development.  
Public endpoints, UI components, and scoring integration are functional.  
Full XRPL indexer and advanced scoring versions will be part of upcoming milestones.

## License
UNLICENSED — proprietary module.  
TRAXR scoring logic is delivered as a private package and is not open-source.
