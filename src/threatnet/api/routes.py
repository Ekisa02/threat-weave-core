from fastapi import APIRouter, HTTPException
from src.threatnet.api.schemas import PredictRequest, PredictResponse
from src.threatnet.core.inference import ThreatDetector
from src.threatnet.logging_config import setup_logging

logger = setup_logging()
router = APIRouter()

# instantiate a singleton detector on import; it loads model if available
_detector = ThreatDetector()

@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest):
    try:
        sample = payload.sample.features
        result = _detector.predict(sample)
        return PredictResponse(id=payload.id, label=result["label"], score=float(result["score"]), meta=result.get("meta"))
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))
