from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "checkpoints"
MODEL_DIR.mkdir(exist_ok=True)

DEFAULT_DEVICE = "cuda" if (os.getenv("USE_CUDA", "0") == "1") else "cpu"

MODEL_FILENAME = os.environ.get("MODEL_FILENAME", str(MODEL_DIR / "model.pt"))
