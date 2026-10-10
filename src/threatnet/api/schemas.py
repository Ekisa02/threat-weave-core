from pydantic import BaseModel, Field
from typing import List, Optional

class FeatureVector(BaseModel):
    features: List[float] = Field(..., description="Flattened input feature vector")

class PredictRequest(BaseModel):
    id: Optional[str] = Field(None, description="Optional request identifier")
    sample: FeatureVector

class PredictResponse(BaseModel):
    id: Optional[str]
    label: str
    score: float
    meta: Optional[dict]
