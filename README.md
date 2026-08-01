# DOP — Digital Oil Properties Global

Pre-production, barrel-denominated physical-energy transaction architecture. It does **not** hold customer funds, issue barrel assets, provide live custody, execute trades or claim verified licensing.

## Local startup

```bash
npm install
npm run dev
npm run server:install
npm --prefix server run dev
```

Development-only UI accounts (`buyer@dop.demo` and `admin@dop.demo`, password `Demo123!`) are seeded frontend access, not server authentication. Browser storage is non-authoritative UI state and must never determine money, ledger balances, KYC or server roles.

## Architecture

```text
React / HashRouter ── HTTPS API ── Fastify command boundary
                                      │
                    ┌─────────────────┼──────────────────┐
                PostgreSQL       Provider ports      Audit chain
             double-entry ledger  fail-closed       append-only
```

- Root: Vite/React public site, wallet-readiness and compliance operations surfaces.
- `server/src`: config, Fastify API, provider interfaces, exact-unit ledger, audit and workflow policy.
- `server/migrations`: PostgreSQL UUID/exact-numeric schema and immutable-row triggers.
- `docker-compose.yml`: local PostgreSQL only.
- `/health/live` only means the process responds. `/health/ready` and `/api/v1/status` expose transaction gates without secrets.

```bash
docker compose up -d postgres
psql "$DATABASE_URL" -f server/migrations/001_preproduction_core.sql
npm run server:build
npm run server:test
```

## Ledger invariants

- Money and barrels use integer minor units in TypeScript and `numeric(38,0)` in PostgreSQL—never floating point.
- Posted transactions balance debit and credit per asset.
- Customer available/reserved, inventory liability and custody-backing control accounts are distinct.
- Posted entries are append-only. Corrections create maker/checker-approved compensating reversals.
- Idempotency, database locking and insufficient-balance checks prevent replay and double spending.

## Trust boundaries and threat model

The browser is untrusted; server RBAC is authoritative. Client prices cannot create quotes. Passwords, tokens, provider secrets, private keys and full KYC documents must never enter audit metadata or logs. Logs redact authorization, cookies, passwords, tokens and API-key fields. Ordinary application roles must not update/delete audit or posted-ledger records; PostgreSQL superusers remain an explicitly trusted operational boundary.

Provider ports default to denial: market/conversion oracles, KYC/AML, sanctions, custody, HSM/KMS and inventory attestation. Custody stores provider references only—never seed phrases/private keys. Confirmation requires fresh sources and configured fees/limits.

## Pre-production gates

Readiness is false unless database/migrations, oracle/conversion, KYC, sanctions, custody, HSM/KMS, licence verification, fees, inventory attestation and reconciliation pass. Unmet commands return `PRECONDITION_REQUIRED`; withdrawals remain blocked. No zero fee, 1:1 USDT conversion, oil backing, provider availability or licence is assumed.

## Release checklist

1. Independently verify client licence evidence and permitted jurisdictions.
2. Configure audited KYC/AML, sanctions, custody, banking/USDT rails, HSM/KMS and oracle providers.
3. Approve fees/limits and inventory-attestation/reconciliation procedures.
4. Complete migration integration, penetration, dependency/SBOM, secret, backup/restore and incident-response testing.
5. Validate maker/checker permissions, ledger/reversal invariants, reconciliation and provider outages in staging.
6. Obtain security, compliance, finance and legal approval before enabling any asset or financial command.

## Static hosting

The GitHub Pages build publishes the public client only. It cannot provide the secure API, database, custody or financial transactions. The API requires a separately secured runtime.
