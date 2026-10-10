import torch
import numpy as np
from src.threatnet.core.model import SequenceClassifier
from src.threatnet.config import MODEL_FILENAME, DEFAULT_DEVICE
from typing import List, Dict

class ThreatDetector:
    """Light wrapper to load a model and run inference on raw feature vectors."""
    def __init__(self, device: str = DEFAULT_DEVICE, model_path: str = MODEL_FILENAME, input_dim: int = None):
        self.device = device
        self.model_path = model_path
        self.model = None
        self.labels = {0: "benign", 1: "malicious"}
        # lazy load
        try:
            if input_dim is None:
                # If no model file exists, create default model placeholder
                self.model = None
            else:
                model = SequenceClassifier(input_dim=input_dim)
                model.load_state_dict(torch.load(model_path, map_location=device))
                model.to(device).eval()
                self.model = model
        except Exception:
            # model may not exist yet; allow inference with a random stub
            self.model = None

    def _preprocess(self, features: List[float]):
        # Accept list of floats and produce torch tensor of shape (1, feat_dim) or (1, seq_len, feat_dim)
        arr = np.asarray(features, dtype=np.float32)
        if arr.ndim == 1:
            import torch
            return torch.from_numpy(arr).unsqueeze(0)  # (1, feat_dim)
        else:
            import torch
            return torch.from_numpy(arr).unsqueeze(0)

    def predict(self, features: List[float]) -> Dict:
        x = self._preprocess(features)
        if self.model is None:
            # If no model, return a deterministic stub: treat sum > threshold as malicious
            score = float(x.sum().item() / (len(features) + 1e-6))
            label = "malicious" if score > 0.5 else "benign"
            return {"label": label, "score": float(score), "meta": {"stub": True}}
        self.model.eval()
        with torch.no_grad():
            x = x.to(self.device)
            logits = self.model(x)
            probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
            class_idx = int(probs.argmax())
            return {"label": self.labels.get(class_idx, str(class_idx)), "score": float(probs[class_idx]), "meta": {"stub": False}}
