# Sentinel Weave Architecture

This document describes the components and data flow.

1) Ingest/API layer
- FastAPI accepts JSON payloads containing a numerical feature vector or structured telemetry.
- A Pydantic schema validates incoming requests.

2) Preprocessing
- Basic validation and shaping of arrays; optional preprocessing hooks can be added.

3) Inference
- ThreatDetector wraps a PyTorch model. On startup, if a checkpoint exists, the model is loaded.
- For minimal installations where no checkpoint is available, a deterministic stub policy is used (useful for testing).

4) Model
- SequenceClassifier provides an LSTM/GRU backbone for sequence/time-series style features.

5) Training
- A CSV dataset loader + training script demonstrate how to train and checkpoint a model.

6) Monitoring / Metrics
- Basic logs are emitted. Integrations for Prometheus or tracing can be added by instrumenting routes and trainer.
