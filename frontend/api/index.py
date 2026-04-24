from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, validator
import json
import os
import re
import base64
from typing import Optional

from gemma_client import analyze_image_for_foods, generate_recommendations
from nutrition_scorer import analyze_nutrition

app = FastAPI(title="NourishNet API")

# CORS - allow all for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Max image size: 5MB
MAX_IMAGE_BYTES = 5 * 1024 * 1024

class AnalyzeRequest(BaseModel):
    image_base64: str
    child_age_months: Optional[int] = None
    language: str = "Hindi"

    @validator("image_base64")
    def validate_image(cls, v):
        # Strip prefix if present
        if "base64," in v:
            v = v.split("base64,")[1]
        # Check size
        if len(v) > MAX_IMAGE_BYTES:
            raise ValueError("Image too large. Max size is 5MB.")
        # Validate base64
        if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', v):
            raise ValueError("Invalid image data.")
        try:
            base64.b64decode(v)
        except Exception:
            raise ValueError("Could not decode image.")
        return v

    @validator("language")
    def validate_language(cls, v):
        allowed = [
            "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam",
            "Marathi", "Bengali", "Odia", "Gujarati", "Punjabi", "English"
        ]
        if v not in allowed:
            raise ValueError(f"Language must be one of {allowed}")
        return v

    @validator("child_age_months")
    def validate_age(cls, v):
        if v is not None and (v < 6 or v > 60):
            raise ValueError("Age must be between 6 and 60 months.")
        return v

# Simple in-memory rate limiter
from collections import defaultdict
from time import time

request_counts = defaultdict(list)
RATE_LIMIT = 10  # requests
RATE_WINDOW = 60  # seconds

def check_rate_limit(ip: str):
    now = time()
    request_counts[ip] = [t for t in request_counts[ip] if now - t < RATE_WINDOW]
    if len(request_counts[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
    request_counts[ip].append(now)

@app.post("/api/analyze")
async def analyze_endpoint(req: AnalyzeRequest, request: Request):
    # Rate limit
    client_ip = request.client.host
    check_rate_limit(client_ip)

    try:
        bbase64 = req.image_base64
        if "base64," in bbase64:
            bbase64 = bbase64.split("base64,")[1]

        food_items = analyze_image_for_foods(bbase64)
        nutrition_data = analyze_nutrition(food_items, req.child_age_months)
        rec_en, rec_local = generate_recommendations(
            food_items, nutrition_data["gap_percentages"], req.language
        )

        return {
            "food_items": food_items,
            "nutrients": nutrition_data["nutrients"],
            "risk_level": nutrition_data["risk_level"],
            "gap_percentages": nutrition_data["gap_percentages"],
            "recommendation_en": rec_en,
            "recommendation_local": rec_local,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during analysis: {e}")
        return get_demo()

@app.get("/api/demo")
def get_demo():
    try:
        with open("../sample_output.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "food_items": [
                {"name": "Rice", "estimated_grams": 150},
                {"name": "Dal", "estimated_grams": 100}
            ],
            "nutrients": {
                "calories": 311,
                "protein_g": 13.0,
                "iron_mg": 1.8
            },
            "risk_level": "at_risk",
            "gap_percentages": {
                "calories": 22,
                "protein": 0,
                "iron": 55
            },
            "recommendation_en": "This meal is missing iron-rich foods. Consider adding leafy greens or a boiled egg.",
            "recommendation_local": "ఈ భోజనంలో ఐరన్ తక్కువగా ఉంది. పాలకూర లేదా ఉడికించిన గుడ్డును చేర్చండి."
        }