# Sentinel Weave

Sentinel Weave is a modular, production-oriented platform for cybersecurity threat detection. It exposes a FastAPI inference service backed by PyTorch models, and includes utilities for dataset loading, training, evaluation, and deployment.

Key features
- Real-time inference API (FastAPI) with clear Pydantic schemas
- PyTorch-based sequence classifier (LSTM), trainer, and evaluation utilities
- Modular project layout for model, API, data, and CLI
- Tests and example data to get started quickly

Architecture (high level)

- API Layer (FastAPI)
  - Accepts structured telemetry/logs or feature vectors
  - Performs preprocessing and calls the inference module
  - Returns classification, score, and metadata

- Inference Layer
  - Lightweight runtime loader that deserializes a PyTorch model
  - Handles batching, device placement, and confidence scoring

- Model & Training
  - Dataset loader (CSV-based) with transforms
  - Trainer module for training, validation, checkpointing, and metrics
  - Model architecture placed in core/model.py

- Utilities
  - Configuration, logging, and CLI helpers
  - Tests to validate API contract and core model behavior

Getting started (quick)

Prerequisites
- Python 3.9+
- pip
- (Optional) CUDA for GPU training

Installation

1) Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Run the API locally

```bash
uvicorn src.threatnet.app:app --reload --port 8000
```

3) Try an example request

```bash
curl -X POST "http://127.0.0.1:8000/predict" -H "Content-Type: application/json" -d @examples/request_example.json
```

Training a model (example)

```bash
python scripts/train.py --data examples/sample_data.csv --out checkpoints/ --epochs 3
```

Project layout

- src/threatnet/: core python package
  - api/: FastAPI routes and schemas
  - core/: model, dataset, trainer, inference, utils
  - config.py: runtime configuration
  - app.py: FastAPI application
- scripts/: utilities for training and evaluation
- tests/: pytest test cases
- docs/: additional documentation

Contributing

Please open issues and PRs. Follow the repository code layout when adding new models or endpoints.

License

MIT
