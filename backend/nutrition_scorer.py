import json

# Target daily needs for child 1-5 years (approx per meal if 3 meals/day)
TARGETS = {
    "calories": 400, # kcal per meal
    "protein": 10,   # g per meal
    "iron": 4,       # mg per meal
}

# Lookup table (values per 100g)
FOOD_DB = {
    "rice": {"calories": 130, "protein": 2.7, "iron": 0.2},
    "dal": {"calories": 116, "protein": 9.0, "iron": 1.5},
    "roti": {"calories": 297, "protein": 9.0, "iron": 2.0},
    "spinach": {"calories": 23, "protein": 2.9, "iron": 2.7},
    "egg": {"calories": 155, "protein": 13.0, "iron": 1.2},
    "milk": {"calories": 42, "protein": 3.4, "iron": 0.0},
    "chicken": {"calories": 165, "protein": 31.0, "iron": 1.0},
    "paneer": {"calories": 265, "protein": 11.0, "iron": 0.1},
    "carrot": {"calories": 41, "protein": 0.9, "iron": 0.3},
    "potato": {"calories": 77, "protein": 2.0, "iron": 0.8},
    # ... expanding for full 60 items as required
}

def analyze_nutrition(food_items: list) -> dict:
    total_calories = 0
    total_protein = 0
    total_iron = 0
    
    for item in food_items:
        name = item.get("name", "").lower()
        grams = item.get("estimated_grams", 0)
        
        # Simple string matching or fallback to averages
        found = False
        for db_name, values in FOOD_DB.items():
            if db_name in name:
                total_calories += (values["calories"] / 100.0) * grams
                total_protein += (values["protein"] / 100.0) * grams
                total_iron += (values["iron"] / 100.0) * grams
                found = True
                break
        
        if not found:
            # Fallback estimation if not found
            total_calories += (100 / 100.0) * grams
            total_protein += (2 / 100.0) * grams
            total_iron += (0.5 / 100.0) * grams

    # Calculate gap
    gap_cal = max(0, int((1 - total_calories / TARGETS["calories"]) * 100))
    gap_prot = max(0, int((1 - total_protein / TARGETS["protein"]) * 100))
    gap_iron = max(0, int((1 - total_iron / TARGETS["iron"]) * 100))

    avg_gap = (gap_cal + gap_prot + gap_iron) / 3

    if avg_gap < 15:
        risk_level = "safe"
    elif avg_gap < 40:
        risk_level = "at_risk"
    else:
        risk_level = "critical"

    return {
        "nutrients": {
            "calories": int(total_calories),
            "protein_g": round(total_protein, 1),
            "iron_mg": round(total_iron, 1)
        },
        "risk_level": risk_level,
        "gap_percentages": {
            "calories": gap_cal,
            "protein": gap_prot,
            "iron": gap_iron
        }
    }
