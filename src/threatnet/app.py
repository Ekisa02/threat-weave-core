from fastapi import FastAPI
from src.threatnet.api.routes import router as api_router
from src.threatnet.logging_config import setup_logging

logger = setup_logging()

app = FastAPI(title="Sentinel Weave - Threat Detection API")
app.include_router(api_router)

@app.get("/health")
async def health():
    return {"status": "ok"}
