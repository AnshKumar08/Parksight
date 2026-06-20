from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import json
import hashlib
from catboost import CatBoostRegressor

app = FastAPI(title="ParkSight AI - ML Inference Engine")

@app.get("/")
def health_check():
    return {"status": "online", "message": "ParkSight AI Engine is active."}

print("Loading CatBoost Model...")
model = CatBoostRegressor()
model.load_model("parksight_model.cbm")

print("Loading Top Hotspot Geohashes...")
with open("top_geohashes.json", "r") as f:
    top_geohashes = json.load(f)

def get_stable_penalty(geohash_str):
    stable_int = int(hashlib.md5(geohash_str.encode()).hexdigest()[:8], 16)
    return 1.0 + (stable_int % 5) / 10.0

precalculated_penalties = [get_stable_penalty(g) for g in top_geohashes]

class DispatchRequest(BaseModel):
    target_time: str 

@app.post("/predict_hotspots")
def predict_hotspots(request: DispatchRequest):
    try:
        target_dt = pd.to_datetime(request.target_time, format="%Y-%m-%d %H:%M:%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use YYYY-MM-DD HH:MM:SS")

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
        "timestamp": request.target_time,
        "recommended_dispatch_zones": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)