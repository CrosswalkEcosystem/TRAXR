# TRAXR Architecture

## Overview
TRAXR provides a modular analytics and scoring layer for XRPL liquidity, built around AMM pools, trustlines, issuers, and market behavior.

## Core Components
- **Frontend (Next.js)**: Interactive dashboard for pool insights.
- **API Layer**: Read-only endpoints for scoring and pool metadata.
- **TRAXR Service**: Handles data loading, caching, fuzzy matching, and scoring delegation.
- **Private Scoring Engine**: External npm module `@crosswalk.pro/traxr-cts-xrpl`.
- **Data Fetch Pipeline**: Script to pull AMM/issuer/trustline data.

## Data Flow
1. XRPL → Fetcher → Normalized JSON
2. JSON → TRAXR Service → Scoring Adapter
3. Scoring Engine → Score + Node Breakdown → UI/API

## Roadmap Integration
Architecture allows replacement of JSON fetcher with a full XRPL indexer.
