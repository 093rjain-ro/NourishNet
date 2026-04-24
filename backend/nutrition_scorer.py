import json

# Target daily needs for child 1-5 years (approx per meal if 3 meals/day)
TARGETS = {
    "calories": 400, # kcal per meal
    "protein": 10,   # g per meal
    "iron": 4,       # mg per meal
}

# Lookup table (values per 100g)
# Sources: ICMR-NIN Indian Food Composition Tables, USDA FoodData Central
FOOD_DB = {
    # ── Grains & Staples ──────────────────────────────────────────────────────
    "rice":             {"calories": 130,  "protein": 2.7,  "iron": 0.2},
    "brown rice":       {"calories": 123,  "protein": 2.6,  "iron": 0.5},
    "roti":             {"calories": 297,  "protein": 9.0,  "iron": 2.0},
    "chapati":          {"calories": 297,  "protein": 9.0,  "iron": 2.0},
    "paratha":          {"calories": 326,  "protein": 8.2,  "iron": 1.8},
    "puri":             {"calories": 340,  "protein": 7.5,  "iron": 1.6},
    "idli":             {"calories": 58,   "protein": 2.0,  "iron": 0.5},
    "dosa":             {"calories": 168,  "protein": 3.9,  "iron": 0.9},
    "upma":             {"calories": 160,  "protein": 3.5,  "iron": 0.8},
    "poha":             {"calories": 110,  "protein": 2.5,  "iron": 1.2},
    "semolina":         {"calories": 360,  "protein": 12.7, "iron": 4.4},
    "wheat":            {"calories": 340,  "protein": 11.8, "iron": 3.9},
    "millet":           {"calories": 378,  "protein": 11.0, "iron": 3.0},
    "bajra":            {"calories": 361,  "protein": 11.6, "iron": 8.0},
    "jowar":            {"calories": 349,  "protein": 10.4, "iron": 4.1},
    "ragi":             {"calories": 328,  "protein": 7.3,  "iron": 3.9},
    "oats":             {"calories": 389,  "protein": 16.9, "iron": 4.7},
    "corn":             {"calories": 86,   "protein": 3.3,  "iron": 0.5},

    # ── Lentils & Legumes ─────────────────────────────────────────────────────
    "dal":              {"calories": 116,  "protein": 9.0,  "iron": 1.5},
    "moong dal":        {"calories": 105,  "protein": 7.6,  "iron": 1.4},
    "toor dal":         {"calories": 114,  "protein": 7.2,  "iron": 1.7},
    "chana dal":        {"calories": 164,  "protein": 8.7,  "iron": 1.9},
    "urad dal":         {"calories": 347,  "protein": 25.2, "iron": 9.0},
    "masoor dal":       {"calories": 116,  "protein": 9.0,  "iron": 2.5},
    "rajma":            {"calories": 127,  "protein": 8.7,  "iron": 2.2},
    "chana":            {"calories": 164,  "protein": 8.9,  "iron": 2.9},
    "chickpea":         {"calories": 164,  "protein": 8.9,  "iron": 2.9},
    "soybean":          {"calories": 173,  "protein": 16.6, "iron": 5.1},
    "peas":             {"calories": 81,   "protein": 5.4,  "iron": 1.5},
    "lentil":           {"calories": 116,  "protein": 9.0,  "iron": 2.5},

    # ── Vegetables ────────────────────────────────────────────────────────────
    "spinach":          {"calories": 23,   "protein": 2.9,  "iron": 2.7},
    "palak":            {"calories": 23,   "protein": 2.9,  "iron": 2.7},
    "potato":           {"calories": 77,   "protein": 2.0,  "iron": 0.8},
    "carrot":           {"calories": 41,   "protein": 0.9,  "iron": 0.3},
    "tomato":           {"calories": 18,   "protein": 0.9,  "iron": 0.3},
    "onion":            {"calories": 40,   "protein": 1.1,  "iron": 0.2},
    "brinjal":          {"calories": 25,   "protein": 1.0,  "iron": 0.2},
    "eggplant":         {"calories": 25,   "protein": 1.0,  "iron": 0.2},
    "cauliflower":      {"calories": 25,   "protein": 1.9,  "iron": 0.4},
    "cabbage":          {"calories": 25,   "protein": 1.3,  "iron": 0.5},
    "beans":            {"calories": 31,   "protein": 1.8,  "iron": 1.0},
    "drumstick":        {"calories": 37,   "protein": 2.1,  "iron": 0.4},
    "bitter gourd":     {"calories": 17,   "protein": 1.0,  "iron": 0.4},
    "bottle gourd":     {"calories": 14,   "protein": 0.6,  "iron": 0.2},
    "pumpkin":          {"calories": 26,   "protein": 1.0,  "iron": 0.8},
    "sweet potato":     {"calories": 86,   "protein": 1.6,  "iron": 0.6},
    "beetroot":         {"calories": 43,   "protein": 1.6,  "iron": 0.8},
    "fenugreek":        {"calories": 49,   "protein": 4.4,  "iron": 3.6},
    "methi":            {"calories": 49,   "protein": 4.4,  "iron": 3.6},

    # ── Proteins (Animal) ─────────────────────────────────────────────────────
    "egg":              {"calories": 155,  "protein": 13.0, "iron": 1.2},
    "chicken":          {"calories": 165,  "protein": 31.0, "iron": 1.0},
    "fish":             {"calories": 136,  "protein": 24.0, "iron": 0.8},
    "mutton":           {"calories": 294,  "protein": 25.6, "iron": 2.7},

    # ── Dairy ─────────────────────────────────────────────────────────────────
    "milk":             {"calories": 42,   "protein": 3.4,  "iron": 0.0},
    "curd":             {"calories": 61,   "protein": 3.5,  "iron": 0.1},
    "yogurt":           {"calories": 61,   "protein": 3.5,  "iron": 0.1},
    "paneer":           {"calories": 265,  "protein": 11.0, "iron": 0.1},
    "ghee":             {"calories": 900,  "protein": 0.0,  "iron": 0.0},
    "butter":           {"calories": 717,  "protein": 0.9,  "iron": 0.0},

    # ── Fruits ────────────────────────────────────────────────────────────────
    "banana":           {"calories": 89,   "protein": 1.1,  "iron": 0.3},
    "apple":            {"calories": 52,   "protein": 0.3,  "iron": 0.1},
    "mango":            {"calories": 60,   "protein": 0.8,  "iron": 0.2},
    "papaya":           {"calories": 43,   "protein": 0.5,  "iron": 0.3},
    "guava":            {"calories": 68,   "protein": 2.6,  "iron": 0.3},
    "orange":           {"calories": 47,   "protein": 0.9,  "iron": 0.1},

    # ── Other Common Items ────────────────────────────────────────────────────
    "sambar":           {"calories": 60,   "protein": 3.2,  "iron": 1.2},
    "khichdi":          {"calories": 124,  "protein": 5.0,  "iron": 1.0},
    "biryani":          {"calories": 196,  "protein": 9.5,  "iron": 1.3},
    "peanut":           {"calories": 567,  "protein": 25.8, "iron": 4.6},
    "groundnut":        {"calories": 567,  "protein": 25.8, "iron": 4.6},
    "coconut":          {"calories": 354,  "protein": 3.3,  "iron": 2.4},
    "jaggery":          {"calories": 383,  "protein": 0.4,  "iron": 11.4},
}


def analyze_nutrition(food_items: list, age_months: int = None) -> dict:
    # Set targets based on age (default to 24-60 months if not provided)
    if age_months is not None:
        if age_months < 12:
            targets = {"calories": 200, "protein": 5, "iron": 3}
        elif age_months < 24:
            targets = {"calories": 300, "protein": 8, "iron": 4}
        else:
            targets = {"calories": 400, "protein": 10, "iron": 4}
    else:
        targets = {"calories": 400, "protein": 10, "iron": 4}

    total_calories = 0
    total_protein = 0
    total_iron = 0

    for item in food_items:
        name = item.get("name", "").lower()
        grams = item.get("estimated_grams", 0)

        found = False
        for db_name, values in FOOD_DB.items():
            if db_name in name or name in db_name:
                total_calories += (values["calories"] / 100.0) * grams
                total_protein  += (values["protein"]  / 100.0) * grams
                total_iron     += (values["iron"]     / 100.0) * grams
                found = True
                break

        if not found:
            # Fallback estimation
            total_calories += (100 / 100.0) * grams
            total_protein  += (2   / 100.0) * grams
            total_iron     += (0.5 / 100.0) * grams

    # Calculate gaps (0 means target met or exceeded)
    gap_cal  = max(0, int((1 - total_calories / targets["calories"]) * 100))
    gap_prot = max(0, int((1 - total_protein  / targets["protein"])  * 100))
    gap_iron = max(0, int((1 - total_iron     / targets["iron"])     * 100))

    avg_gap = (gap_cal + gap_prot + gap_iron) / 3

    if avg_gap < 15:
        risk_level = "safe"
    elif avg_gap < 40:
        risk_level = "at_risk"
    else:
        risk_level = "critical"

    return {
        "nutrients": {
            "calories":  int(total_calories),
            "protein_g": round(total_protein, 1),
            "iron_mg":   round(total_iron, 1)
        },
        "risk_level": risk_level,
        "gap_percentages": {
            "calories": gap_cal,
            "protein":  gap_prot,
            "iron":     gap_iron
        }
    }