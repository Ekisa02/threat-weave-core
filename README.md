# Sentinel Weave

Sentinel Weave is a modular, extensible cybersecurity threat detection platform built with Next.js and TypeScript. It provides an API-first ingestion pipeline, a rule-based & simple anomaly detection engine, in-memory stores for fast prototyping, and test coverage to get you started building production-grade detection and alerting systems.

Key features:
- Rule-based signature detection (regex/condition rules)
- Lightweight statistical anomaly detection (running z-score based)
- Pluggable stores and processing pipeline
- Next.js API routes for ingestion, rule management, and alerts
- Typescript-first codebase with unit tests configured (Jest + ts-jest)

Architecture
------------

High-level components:

- API (Next.js): HTTP endpoints for ingesting events, managing detection rules, and fetching alerts.
- Detection Engine: Core processing pipeline that evaluates incoming events against rules and anomaly detectors.
- Store: Pluggable storage (in-memory implementation included) for events, rules and alerts.
- Utilities: Logging and configuration helpers.
- Tests: Unit tests for the detection engine and rule evaluation.

ASCII diagram:

  +----------+      +----------------+      +---------+
  |  Clients | ---> | Next.js / API  | ---> | Engine  | ---> Store
  +----------+      +----------------+      +---------+
                               |               |
                               |               +--> Alert sink/exports
                               +--> Rule API

Installation
------------

Requirements:
- Node.js 18+ (LTS)
- npm or yarn

Clone and install:

1. git clone <repo-url>
2. cd sentinel-weave
3. npm install

Configuration
-------------
Copy the sample environment file:

  cp .env.example .env

The example contains only non-sensitive defaults. For production, secure secrets and enable persistent storage.

Scripts
-------
- npm run dev — run Next.js in development mode
- npm run build — build the Next.js app
- npm run start — start the production server (after build)
- npm run test — run Jest unit tests
- npm run lint — run ESLint (basic)
- npm run typecheck — run TypeScript type checks

Usage
-----
Start dev server:

  npm run dev

Example ingestion request (JSON):

POST /api/ingest
Content-Type: application/json

{
  "id": "evt-123",
  "source": "firewall-1",
  "type": "connection",
  "timestamp": "2026-11-01T12:00:00Z",
  "message": "Failed login from 10.1.2.3",
  "metrics": { "login_failures": 1 }
}

Example CLI curl to fetch alerts:

  curl http://localhost:3000/api/alerts

Extending the project
---------------------
- Swap the in-memory store with a persistent store (Postgres, Elastic, DynamoDB).
- Add advanced ML/streaming detectors (e.g., Kafka + model scoring service).
- Add authentication, RBAC, and telemetry exports (Prometheus/metrics).

Security notes
--------------
- This repository is a reference implementation. It uses in-memory stores and lacks authentication — do not run in production without securing endpoints and using persistent, hardened storage.
- Sanitize inputs when adding rule patterns that will be compiled into regexes.

License
-------
MIT
