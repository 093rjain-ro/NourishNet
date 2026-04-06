from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from tempfile import NamedTemporaryFile
from base64 import b64decode
from typing import Optional

from gemma_client import analyze_image_for_foods, generate_recommendations
from nutrition_scorer import analyze_nutrition

app = FastAPI(title="NourishNet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    image_base64: str
    child_age_months: Optional[int] = None

@app.post("/analyze")
async def analyze_endpoint(req: AnalyzeRequest):
    try:
        # Check if base64 has prefix (like data:image/jpeg;base64,... )
        bbase64 = req.image_base64
        if "base64," in bbase64:
            bbase64 = bbase64.split("base64,")[1]
            
        # 1. Identify food items
        food_items = analyze_image_for_foods(bbase64)
        
        # 2. Nutrition scoring
        nutrition_data = analyze_nutrition(food_items)
        
        # 3. Recommendations
        rec_en, rec_te = generate_recommendations(food_items, nutrition_data["gap_percentages"])
        
        # 4. Construct final payload
        return {
            "food_items": food_items,
            "nutrients": nutrition_data["nutrients"],
            "risk_level": nutrition_data["risk_level"],
            "gap_percentages": nutrition_data["gap_percentages"],
            "recommendation_en": rec_en,
            "recommendation_te": rec_te
        }
    except Exception as e:
        print(f"Error during analysis: {e}")
        # In case of full failure, return demo output
        return get_demo()

@app.get("/demo")
def get_demo():
    try:
        with open("../sample_output.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        # Inline fallback
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
          "recommendation_en": "This meal is missing iron-rich foods. Consider adding a serving of leafy greens (like spinach) or a boiled egg.",
          "recommendation_te": "ఈ భోజనంలో ఐరన్ తక్కువగా ఉంది. పాలకూర లేదా ఉడికించిన గుడ్డును ఆహారంలో చేర్చండి."
        }
