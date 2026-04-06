import os
import requests
import json
import traceback
import google.generativeai as genai

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GOOGLE_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Fallback fake output if both fail
FALLBACK_FOODS = [
    {"name": "Rice", "estimated_grams": 150},
    {"name": "Dal", "estimated_grams": 100}
]

def call_ollama(prompt: str, image_b64: str = None) -> str:
    url = f"{OLLAMA_HOST}/api/generate"
    # We use a placeholder image model like llava if an image is provided,
    # or gemma if text only. The user asked for "Gemma 4 multimodal".
    model = "llava" if image_b64 else "gemma" 
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    if image_b64:
        payload["images"] = [image_b64]
        
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Ollama failed: {e}")
        return ""

def call_google_gemini(prompt: str, image_b64: str = None) -> str:
    if not GOOGLE_API_KEY:
        return ""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Simplified for now, just sending text, as sending base64 direct to gemini 
        # requires specific formatting depending on SDK version
        import base64
        contents = [prompt]
        if image_b64:
            img_data = base64.b64decode(image_b64)
            image_parts = [
                {
                    "mime_type": "image/jpeg",
                    "data": img_data
                }
            ]
            contents.append(image_parts[0])
            
        # Try generating
        resp = model.generate_content(contents)
        text = resp.text
        # Clean up possible markdown json block
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return text.strip()
    except Exception as e:
        print(f"Gemini failed: {e}")
        return ""

def analyze_image_for_foods(image_b64: str) -> list:
    prompt = "Analyze this image of an Indian meal. Extract the food items visible and estimate their weight in grams. Return ONLY a JSON object with a key 'food_items' containing a list of objects, each with 'name' (string) and 'estimated_grams' (integer). Example: {\"food_items\": [{\"name\": \"Rice\", \"estimated_grams\": 150}]}"
    
    res = call_ollama(prompt, image_b64)
    if not res:
        res = call_google_gemini(prompt, image_b64)
    
    if not res:
        return FALLBACK_FOODS
        
    try:
        data = json.loads(res)
        return data.get("food_items", FALLBACK_FOODS)
    except Exception as e:
        print(f"JSON parse error for foods: {e}\nResponse was: {res}")
        return FALLBACK_FOODS

def generate_recommendations(food_items: list, gaps: dict) -> tuple:
    prompt = f"Given these food items: {food_items} and nutritional gaps (calories: {gaps.get('calories')}%, protein: {gaps.get('protein')}%, iron: {gaps.get('iron')}%)... Generate a short recommendation for a 1-5 year old child to address these gaps. Return ONLY a JSON object with keys 'recommendation_en' (English text) and 'recommendation_te' (Telugu text). No markdown, just raw JSON."
    
    res = call_ollama(prompt)
    if not res:
        res = call_google_gemini(prompt)
        
    fallback_en = "Consider adding leafy greens or egg to boost iron and protein."
    fallback_te = "ఐరన్ మరియు ప్రోటీన్‌ను పెంచడానికి ఆకుకూరలు లేదా గుడ్డును జోడించడం గురించి ఆలోచించండి."
    
    if not res:
        return fallback_en, fallback_te
        
    try:
        data = json.loads(res)
        return data.get("recommendation_en", fallback_en), data.get("recommendation_te", fallback_te)
    except:
        return fallback_en, fallback_te
