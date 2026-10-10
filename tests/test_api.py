from fastapi.testclient import TestClient
from src.threatnet.app import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"

def test_predict_stub():
    payload = {
        "id": "t1",
        "sample": {"features": [0.01, 0.02, 0.03]}
    }
    r = client.post("/predict", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "label" in data
    assert "score" in data
