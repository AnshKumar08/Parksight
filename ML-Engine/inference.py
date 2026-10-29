import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import json
import hashlib
from catboost import CatBoostRegressor

app = FastAPI(title="ParkSight AI - ML Inference Engine")

# Configure CORS middleware
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "parksight_model.cbm"
GEOHASH_PATH = BASE_DIR / "top_geohashes.json"

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "online", "message": "ParkSight AI Engine is active."}

print(f"Loading CatBoost Model from {MODEL_PATH}...")
model = CatBoostRegressor()
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
model.load_model(str(MODEL_PATH))

print(f"Loading Top Hotspot Geohashes from {GEOHASH_PATH}...")
if not GEOHASH_PATH.exists():
    raise FileNotFoundError(f"Geohashes file not found at {GEOHASH_PATH}")
with open(GEOHASH_PATH, "r", encoding="utf-8") as f:
    top_geohashes = json.load(f)

def get_stable_penalty(geohash_str: str) -> float:
    stable_int = int(hashlib.md5(geohash_str.encode("utf-8")).hexdigest()[:8], 16)
    return 1.0 + (stable_int % 5) / 10.0

precalculated_penalties = [get_stable_penalty(g) for g in top_geohashes]

class DispatchRequest(BaseModel):
    target_time: str = Field(
        ...,
        min_length=10,
        max_length=30,
        pattern=r"^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$",
        description="Target timestamp in YYYY-MM-DD HH:MM:SS format"
    )

@app.post("/predict_hotspots")
def predict_hotspots(request: DispatchRequest):
    clean_time = request.target_time.replace("T", " ").strip()
    if len(clean_time) == 16:
        clean_time += ":00"

    try:
        target_dt = pd.to_datetime(clean_time, format="%Y-%m-%d %H:%M:%S")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid time format. Expected YYYY-MM-DD HH:MM:SS (e.g. 2024-05-10 10:00:00)"
        )

    hour = target_dt.hour
    day_of_week = target_dt.dayofweek

    hour_sin = np.sin(2 * np.pi * hour / 24.0)
    hour_cos = np.cos(2 * np.pi * hour / 24.0)
    day_sin = np.sin(2 * np.pi * day_of_week / 7.0)
    day_cos = np.cos(2 * np.pi * day_of_week / 7.0)

    inference_df = pd.DataFrame({
        'geohash': top_geohashes,
        'hour_sin': hour_sin,
        'hour_cos': hour_cos,
        'day_sin': day_sin,
        'day_cos': day_cos
    })

    predictions = model.predict(inference_df)
    
    # Fail-safe for Poisson distribution bounds
    inference_df['predicted_violations'] = np.maximum(0, predictions)
    inference_df['junction_penalty'] = precalculated_penalties
    inference_df['choke_score'] = inference_df['predicted_violations'] * inference_df['junction_penalty']
    
    top_10_df = inference_df.nlargest(10, 'choke_score')
    
    results = [
        {
            "geohash": row['geohash'],
            "predicted_violations": round(row['predicted_violations'], 2),
            "choke_score": round(row['choke_score'], 2)
        }
        for _, row in top_10_df.iterrows()
    ]
    
    return {
        "timestamp": clean_time,
        "recommended_dispatch_zones": results
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)