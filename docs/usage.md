# Usage Guide

Starting the API

uvicorn src.threatnet.app:app --reload --port 8000

Predicting

POST /predict
Body: { "id": "id1", "sample": { "features": [ ... ] } }

Training

python scripts/train.py --data examples/sample_data.csv --out checkpoints --epochs 3

Evaluation

python scripts/evaluate.py --data examples/sample_data.csv --model checkpoints/model.pt
