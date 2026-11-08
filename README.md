# Sentinel Weave

Sentinel Weave is a modular cybersecurity threat detection platform built with Next.js and Node (TypeScript). It provides a lightweight ingestion API, a pluggable detection engine (rule-based + simple anomaly detector), alert management with an optional Postgres backend, and a minimal UI to inspect alerts. The project is structured to be production-ready and easy to extend with additional detectors, persistence adapters, or orchestration (Redis/Bull, external ML models).

## Architecture Overview

- Frontend: Next.js pages (React) for viewing alerts and health.
- API: Next.js API routes for ingestion and alert retrieval.
- Detection Engine (lib/detectors): pluggable detectors (ruleEngine, anomalyDetector). Each detector processes events and emits Alert objects.
- Alert Store (lib/alertStore): in-memory store with an optional Postgres adapter (lib/db.ts) for persistence.
- Worker (lib/worker.ts): simple background processor that drains the ingest queue and runs detectors. Designed for replacement with a queue system like Bull/BullMQ + Redis.
- Types: centralized TypeScript types in lib/types.ts.

Sequence:
1. Events are POSTed to /api/ingest.
2. Events are queued in memory (lib/ingest.ts).
3. A background worker processes queued events, runs detectors, and stores alerts.
4. Alerts are available via /api/alerts and a simple UI at the root URL.

## Features

- Pluggable detectors: add new detectors under src/lib/detectors.
- Simple anomaly detector using sliding-window counts.
- Extensible alert store with Postgres adapter (optional).
- Jest tests for detectors.
- Dockerfile + docker-compose for local dev including Postgres.

## Quickstart (local)

Requirements:
- Node 16+ (or compatible)
- Docker & docker-compose (optional if you want Postgres)

Install and run:

1. Install dependencies

```bash
npm install
```

2. Start in development mode

```bash
npm run dev
```

3. Ingest an event (example)

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"id":"evt-1","source":"app-frontend","timestamp":"2026-01-01T12:00:00Z","message":"Failed login for admin from 1.2.3.4","meta":{"ip":"1.2.3.4","user":"admin"}}'
```

4. View alerts

Open http://localhost:3000 to see the alert list, or fetch via API:

```bash
curl http://localhost:3000/api/alerts
```

## Docker Compose (optional)

There is a docker-compose.yml that sets up a web service and a Postgres database. To boot everything:

```bash
docker-compose up --build
```

Configure database settings via .env (see .env.example).

## Development Notes

- Add detectors in src/lib/detectors and register them in src/lib/worker.ts (or integrate with a registry).
- Alert persistence is optional; if DATABASE_URL is set, alerts will be persisted to Postgres via a minimal adapter in lib/db.ts.
- Replace the in-memory queue with a robust queue (Bull/BullMQ) for high-throughput ingestion.

## Testing

Run unit tests with:

```bash
npm test
```

## Project Layout

- src/pages - Next.js pages and API routes
- src/lib - core logic: detectors, ingest, alert store, db adapter, worker
- tests - unit tests for detection logic

## Contributing

Contributions welcome. Keep detectors small and idempotent; ensure alerts are well-typed. Add tests for new detection modules.
