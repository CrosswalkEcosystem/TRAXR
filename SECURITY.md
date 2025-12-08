# TRAXR Security Policy

TRAXR is a read-only analytics and risk-intelligence layer for XRPL liquidity.
It does **not** hold private keys, does not sign transactions, and does not
interface directly with user wallets. All logic exposed in this repository is
limited to data ingestion, scoring integration, and visualization.

The core scoring model is shipped as a **private NPM package**
`@crosswalk.pro/traxr-cts-xrpl` and is not open-source.

---

## Supported Versions

TRAXR is currently in active MVP development.

```
| Component          | Status        |
| ------------------ | ------------- |
| TRAXR Dashboard    | Supported     |
| TRAXR API          | Supported     |
| XRPL Fetch Scripts | Experimental  |
```

Breaking changes may occur while TRAXR is in pre-1.0 versions.

---

## Vulnerability Reporting

If you believe you have found a security vulnerability related to:

- TRAXR API behavior
- data exposure or incorrect isolation
- potential abuse vectors (e.g. DoS via public endpoints)
- documentation errors that may mislead integrators

please **do not** open a public GitHub issue.

Instead, contact us privately at:

- **Email:** security@crosswalk.pro

Include as much detail as possible:

- steps to reproduce
- affected endpoints or components
- expected vs. actual behavior
- any relevant logs or payloads (redacting sensitive info)

We will:

1. Acknowledge receipt of your report.
2. Investigate the issue.
3. Provide a remediation timeline where applicable.

---

## Scope

In-scope:

- TRAXR public dashboard and API as deployed on `traxr.pro` or related subdomains
- this repository’s code paths used for production deployments
- configuration mistakes that could lead to data leaks or abuse

Out-of-scope:

- XRPL core protocol or validators
- third-party RPC providers or infrastructure
- local development environments of integrators
- private NPM package internals of `@crosswalk.pro/traxr-cts-xrpl`

---

## Security Principles

TRAXR follows these principles:

- **Read-only by design** – no transaction signing, no wallet key access.
- **Minimal data surface** – only what is needed for scoring and analytics.
- **Isolated scoring engine** – proprietary model surfaced through a narrow adapter.
- **Configurable deployment** – operators can layer rate limiting, caching, and WAF rules.

If you have questions about how to deploy TRAXR more securely in your own infra,
reach out at `support@crosswalk.pro`.
