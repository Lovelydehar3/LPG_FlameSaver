from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import csv
import logging
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    logger.info("🔥 SmartFlame AI Backend Started!")
    logger.info(f"🔥 API available at http://localhost:8000")
    logger.info(f"🔥 Health check: http://localhost:8000/health")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENROUTER_API_KEY")
if api_key:
    client = OpenAI(api_key=api_key, base_url="https://openrouter.io/api/v1")
    logger.info("✅ OpenRouter API key loaded")
else:
    client = None
    logger.warning("⚠️  OPENROUTER_API_KEY not set - using mock responses only")

# ── Food database ──────────────────────────────────────────────────────────────
FOODS_CSV = """food,cook_time_min_per_100g,lpg_units,category,avoid_during_shortage
Dal (lentils),20,0.3,protein,No
Rajma,40,0.6,protein,Yes
Chole,35,0.5,protein,Yes
Moong Dal,15,0.2,protein,No
Masoor Dal,15,0.2,protein,No
Paneer,10,0.1,protein,No
Eggs (boiled),10,0.1,protein,No
Rice (plain),20,0.3,carbs,No
Roti (tawa),2,0.05,carbs,No
Poha,10,0.1,carbs,No
Upma,15,0.2,carbs,No
Pasta,12,0.2,carbs,No
Bread (store bought),0,0,carbs,No
Biryani,45,0.8,rice,Yes
Aloo Sabzi,20,0.3,vegetable,No
Gobi Sabzi,15,0.2,vegetable,No
Palak,15,0.2,vegetable,No
Onion Tomato Base,15,0.2,vegetable,No
Mix Veg,20,0.3,vegetable,No
Khichdi,25,0.3,protein,No
Sarson da Saag,45,0.7,vegetable,Yes
Makki di Roti,5,0.1,carbs,No
Dum Aloo,35,0.6,vegetable,Yes
Naan,3,0.1,carbs,No
Paratha (plain),5,0.1,carbs,No
Paratha (stuffed),8,0.15,carbs,No
Maggi Noodles,5,0.1,carbs,No
Suji Halwa,15,0.2,sweet,No
Besan Chilla,10,0.15,protein,No
Kadhi Pakora,40,0.6,protein,Yes
Chana Dal,30,0.45,protein,Yes
Urad Dal,25,0.35,protein,No
Toor Dal,20,0.3,protein,No
Aloo Paratha,10,0.15,carbs,No
Vegetable Pulao,25,0.4,rice,No
Jeera Rice,20,0.3,rice,No
Idli,15,0.2,carbs,No
Dosa,5,0.1,carbs,No
Sambhar,25,0.4,protein,No
Aloo Matar,25,0.35,vegetable,No
Bhindi Sabzi,15,0.2,vegetable,No
Baingan Bharta,30,0.5,vegetable,Yes
Dal Makhani,50,0.9,protein,Yes
Butter Chicken,40,0.7,protein,Yes
Chicken Curry,35,0.6,protein,Yes
Boiled Chicken,25,0.4,protein,No
Fish Curry,20,0.3,protein,No
Oats (plain),5,0.1,carbs,No
Vermicelli (Seviyan),10,0.15,carbs,No"""

# Parse CSV into a list of dicts for programmatic use
def parse_foods():
    foods = []
    lines = FOODS_CSV.strip().split("\n")
    reader = csv.DictReader(lines)
    for row in reader:
        row["lpg_units"] = float(row["lpg_units"])
        row["cook_time_min_per_100g"] = int(row["cook_time_min_per_100g"])
        foods.append(row)
    return foods

ALL_FOODS = parse_foods()

# LPG limits per cylinder level
LPG_LIMITS = {"low": 0.2, "medium": 0.4, "full": 9999}

# ── System prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = f"""You are SmartFlame AI — an expert in fuel-efficient meal planning for Indian families managing LPG cylinder shortages.

FOOD DATABASE (CSV):
{FOODS_CSV}

*** CRITICAL INSTRUCTION ***
You MUST read the user's available ingredients carefully and create meals ONLY using those ingredients.
If the user says they have "channa, rice, oil, salt" — recommend meals with THOSE ingredients.
Do NOT recommend rice if they only have channa/chickpeas.
ALWAYS match recommendations to available ingredients first.

YOUR JOB:
Create a complete 7-day weekly meal plan (breakfast, lunch, dinner every day) that:
1. **USES ONLY THE INGREDIENTS THE USER HAS** - This is the highest priority
2. Saves LPG cylinder by prioritizing low lpg_units foods
3. Respects the user's diet preference (vegetarian/non-vegetarian/both)
4. Creates unique meals for each day by combining user's ingredients in different ways
5. Scales portions to family size
6. Keeps daily total LPG usage within the cylinder_level limits:
   - LOW cylinder (< 25%): max 1.5 LPG units/day total across all meals
   - MEDIUM cylinder (25-75%): max 2.5 LPG units/day total
   - FULL cylinder (> 75%): max 4.0 LPG units/day total
7. Avoids foods marked avoid_during_shortage=Yes when cylinder is LOW or MEDIUM
8. Provides variety — never repeat the same meal on consecutive days
9. Includes "no-cook" or quick options (lpg_units=0) for at least 1 meal per day when cylinder is LOW

IMPORTANT RULES:
- Vegetarian users: NEVER include Eggs, Chicken curry, Egg curry in recommendations
- Non-vegetarian: include variety of both veg and non-veg
- Each meal entry must specify: food name, LPG units for that meal, cook time
- If user has limited ingredients, prioritize variety by cooking methods (fried, boiled, curried, etc)

RESPOND ONLY in valid JSON. No markdown, no code fences. Exact format:
{{
  "summary": "2-3 sentence personalized summary mentioning cylinder level, days left, family size, and estimated total LPG that will be used",
  "lpg_saved_estimate": "e.g. You will use ~12.5 units over 7 days, saving ~4 units vs normal cooking",
  "daily_lpg_budget": "e.g. 2.5 units/day (MEDIUM cylinder)",
  "recommended_foods": [
    {{"name": "...", "lpg_units": 0.0, "cook_time": "X mins", "tip": "...", "category": "..."}}
  ],
  "avoid_foods": [
    {{"name": "...", "reason": "..."}}
  ],
  "weekly_plan": {{
    "monday":    {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "tuesday":   {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "wednesday": {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "thursday":  {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "friday":    {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "saturday":  {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}},
    "sunday":    {{"breakfast": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "lunch": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "dinner": {{"meal": "...", "lpg": 0.0, "cook_time": "X mins", "tip": "..."}}, "day_total_lpg": 0.0}}
  }}
}}"""


# ── Request models ─────────────────────────────────────────────────────────────
class RecommendRequest(BaseModel):
    cylinder_level: str
    diet_preference: str
    family_members: int
    days_until_cylinder: int
    ingredients: str


class SaveInputRequest(BaseModel):
    cylinder_level: str
    diet_preference: str
    family_members: int
    days_until_cylinder: int
    ingredients: str


# ── Helper: filter foods by diet & cylinder level ──────────────────────────────
def filter_foods(diet: str, cylinder: str):
    limit = LPG_LIMITS.get(cylinder.lower(), 0.4)
    non_veg_items = ["Chicken", "Fish", "Eggs", "Butter", "Boiled Chicken"]
    result = []
    for f in ALL_FOODS:
        # Filter by diet preference
        if diet == "vegetarian":
            if any(item in f["food"] for item in non_veg_items):
                continue
        # Avoid high-LPG items during shortage
        if cylinder.lower() in ("low", "medium") and f["avoid_during_shortage"] == "Yes":
            continue
        if f["lpg_units"] <= limit:
            result.append(f)
    return result


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.post("/recommend")
async def recommend(req: RecommendRequest):
    logger.info(f"🔥 NEW REQUEST: cylinder={req.cylinder_level}, diet={req.diet_preference}, family={req.family_members}, ingredients={req.ingredients}")
    
    valid_levels = ["low", "medium", "full"]
    valid_diets  = ["vegetarian", "non-vegetarian", "both"]

    if req.cylinder_level.lower() not in valid_levels:
        raise HTTPException(status_code=400, detail=f"Invalid cylinder level. Must be one of: {valid_levels}")
    if req.diet_preference.lower() not in valid_diets:
        raise HTTPException(status_code=400, detail=f"Invalid diet preference. Must be one of: {valid_diets}")

    # Family size multiplier for LPG scaling info
    members = req.family_members
    if members <= 2:
        multiplier = "1x"
    elif members <= 4:
        multiplier = "1.5x"
    elif members <= 8:
        multiplier = "2x"
    else:
        multiplier = "3x"

    user_message = f"""
=== USER INPUT ===
Cylinder level: {req.cylinder_level}
Diet preference: {req.diet_preference}
Family size: {req.family_members} people (LPG multiplier: {multiplier})
Days until new cylinder delivery: {req.days_until_cylinder}
Available ingredients I HAVE: {req.ingredients}

=== YOUR TASK ===
Create a 7-day meal plan using ONLY the above ingredients I have.
- Do NOT recommend foods that need ingredients I don't have
- Create different recipes/cooking methods for the same ingredients to add variety
- Every meal recommendation MUST use only ingredients from my "Available ingredients" list
- Be creative: same ingredient can be boiled, fried, curried, mixed differently for variety

Example: If I have "channa, rice, onion, salt" — 
  - Monday breakfast: Boiled channa with rice
  - Monday lunch: Channa curry with onion and rice
  - Monday dinner: Fried channa with salt
  - Tuesday breakfast: Channa + rice porridge
  etc.

Make sure all meals respect the LPG limits for {req.cylinder_level} cylinder.
"""

    try:
        logger.info("📞 Calling OpenRouter API...")
        if not client:
            logger.warning("⚠️  No API key available, using mock response")
            return _mock_response(req)
        
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            max_tokens=3000,
            temperature=0.7,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ]
        )
        raw = response.choices[0].message.content.strip()
        logger.info("✅ API response received")
        
        # Strip markdown fences if model adds them anyway
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        result = json.loads(raw)
        logger.info(f"✨ Returning meal plan with {len(result.get('weekly_plan', {}))} days")
        return result

    except json.JSONDecodeError as je:
        logger.error(f"❌ JSON parse error: {je}\nRaw response: {raw[:500]}")
        logger.info("🔄 Using mock response instead")
        return _mock_response(req)
        
    except Exception as e:
        logger.error(f"❌ API Error: {type(e).__name__}: {str(e)}")
        logger.info("🔄 Using mock response as fallback")
        # Fallback mock for development / when API is down
        return _mock_response(req)


def _mock_response(req: RecommendRequest):
    """Development fallback when API is unavailable - dynamically uses user ingredients."""
    logger.warning("⚠️  Using MOCK response (API not available)")
    
    is_veg = req.diet_preference == "vegetarian"
    ingredients = req.ingredients.lower()
    
    logger.info(f"📝 Parsing ingredients: {ingredients}")
    
    # Parse user ingredients
    has_channa = "channa" in ingredients or "chickpea" in ingredients
    has_dal = "dal" in ingredients or "lentil" in ingredients
    has_rice = "rice" in ingredients
    has_wheat = "wheat" in ingredients or "flour" in ingredients or "atta" in ingredients
    has_paneer = "paneer" in ingredients
    has_poha = "poha" in ingredients or "flattened rice" in ingredients
    has_oats = "oat" in ingredients
    has_eggs = "egg" in ingredients and not is_veg
    has_chicken = "chicken" in ingredients and not is_veg
    
    logger.info(f"✓ Found: dal={has_dal}, channa={has_channa}, rice={has_rice}, wheat={has_wheat}, paneer={has_paneer}, eggs={has_eggs}, chicken={has_chicken}")
    
    # Build recommendations based on what user has
    recommended = []
    if has_dal:
        recommended.append({"name": "Dal (lentils)", "lpg_units": 0.3, "cook_time": "20 mins", "tip": "Pressure cook for speed", "category": "protein"})
    if has_channa:
        recommended.append({"name": "Chole (chickpeas)", "lpg_units": 0.6, "cook_time": "35 mins", "tip": "Soak overnight to save LPG", "category": "protein"})
    if has_rice:
        recommended.append({"name": "Rice (plain)", "lpg_units": 0.25, "cook_time": "18 mins", "tip": "Cook with dal for complete meal", "category": "carbs"})
    if has_wheat:
        recommended.append({"name": "Paratha", "lpg_units": 0.12, "cook_time": "8 mins", "tip": "Make extra for next day", "category": "carbs"})
    if has_poha:
        recommended.append({"name": "Poha", "lpg_units": 0.1, "cook_time": "8 mins", "tip": "Quickest breakfast option", "category": "carbs"})
    if has_oats:
        recommended.append({"name": "Oats (instant)", "lpg_units": 0.05, "cook_time": "5 mins", "tip": "Lowest LPG breakfast", "category": "carbs"})
    if has_paneer:
        recommended.append({"name": "Paneer bhurji", "lpg_units": 0.15, "cook_time": "10 mins", "tip": "Quick protein dish", "category": "protein"})
    if has_eggs:
        recommended.append({"name": "Eggs (boiled)", "lpg_units": 0.15, "cook_time": "10 mins", "tip": "Great for breakfast", "category": "protein"})
    if has_chicken:
        recommended.append({"name": "Chicken curry", "lpg_units": 0.5, "cook_time": "30 mins", "tip": "Make extra for lunch next day", "category": "protein"})
    
    # If no specific ingredients, use generics
    if not recommended:
        logger.info("⚠️  No specific ingredients found, using generic recommendations")
        recommended = [
            {"name": "Dal (lentils)", "lpg_units": 0.3, "cook_time": "20 mins", "tip": "Versatile protein", "category": "protein"},
            {"name": "Rice (plain)", "lpg_units": 0.25, "cook_time": "18 mins", "tip": "Pair with dal", "category": "carbs"},
            {"name": "Aloo sabzi", "lpg_units": 0.2, "cook_time": "15 mins", "tip": "Simple vegetable", "category": "vegetable"},
        ]
    else:
        logger.info(f"✨ Created {len(recommended)} food recommendations based on your ingredients")
    
    return {
        "summary": f"✓ Custom 7-day plan for your {req.cylinder_level} cylinder, {req.family_members} people, {req.days_until_cylinder} days until delivery. Using your ingredients: {req.ingredients}",
        "lpg_saved_estimate": "Estimated 10-15 LPG units over 7 days using your ingredients efficiently",
        "daily_lpg_budget": "2.0 units/day" if req.cylinder_level == "medium" else f"{['1.5', '2.5', '4.0'][['low', 'medium', 'full'].index(req.cylinder_level.lower())]} units/day",
        "recommended_foods": recommended,
        "avoid_foods": [
            {"name": "Foods not in your ingredients list", "reason": "Focus on what you have available"}
        ],
        "weekly_plan": {
            "monday":    {"breakfast": {"meal": f"{'Channa' if has_channa else 'Dal'} with bread", "lpg": 0.35, "cook_time": "15 mins", "tip": "Start your week"}, "lunch": {"meal": f"{'Channa curry' if has_channa else 'Dal'} + {'rice' if has_rice else 'bread'}", "lpg": 0.5, "cook_time": "25 mins", "tip": "Hearty lunch"}, "dinner": {"meal": f"{'Rice' if has_rice else 'Paratha'} + vegetable", "lpg": 0.3, "cook_time": "15 mins", "tip": "Light dinner"}, "day_total_lpg": 1.15},
            "tuesday":   {"breakfast": {"meal": f"{'Poha' if has_poha else 'Oats' if has_oats else 'Dal'}", "lpg": 0.1, "cook_time": "8 mins", "tip": "Quick & light"}, "lunch": {"meal": f"{'Channa' if has_channa else 'Dal'} curry", "lpg": 0.5, "cook_time": "25 mins", "tip": "Different cooking method"}, "dinner": {"meal": "Bread + side", "lpg": 0.25, "cook_time": "12 mins", "tip": "Leftover-friendly"}, "day_total_lpg": 0.85},
            "wednesday": {"breakfast": {"meal": f"{'Oats' if has_oats else 'Poha' if has_poha else 'Rice'} porridge", "lpg": 0.15, "cook_time": "10 mins", "tip": "Mid-week boost"}, "lunch": {"meal": f"{'Paneer' if has_paneer else 'Dal'} with {'rice' if has_rice else 'wheat'}", "lpg": 0.45, "cook_time": "20 mins", "tip": "Protein-rich"}, "dinner": {"meal": f"{'Channa' if has_channa else 'Dal'} salad (no cook)", "lpg": 0.0, "cook_time": "0 mins", "tip": "Save gas today"}, "day_total_lpg": 0.6},
            "thursday":  {"breakfast": {"meal": f"{'Paratha' if has_wheat else 'Rice'} + curd", "lpg": 0.2, "cook_time": "10 mins", "tip": "Filling start"}, "lunch": {"meal": f"{'Dal' if has_dal else 'Channa'} + {'rice' if has_rice else 'wheat'}", "lpg": 0.5, "cook_time": "25 mins", "tip": "Back to staples"}, "dinner": {"meal": f"{'Paneer' if has_paneer else 'Egg' if has_eggs else 'Dal'} + bread", "lpg": 0.35, "cook_time": "18 mins", "tip": "Protein dinner"}, "day_total_lpg": 1.05},
            "friday":    {"breakfast": {"meal": f"{'Channa' if has_channa else 'Dal'} upma style", "lpg": 0.25, "cook_time": "15 mins", "tip": "Friday special"}, "lunch": {"meal": f"{'Chicken' if has_chicken else 'Paneer' if has_paneer else 'Dal'} curry", "lpg": 0.55, "cook_time": "30 mins", "tip": "Festive meal"}, "dinner": {"meal": "Light salad + bread", "lpg": 0.1, "cook_time": "5 mins", "tip": "Weekend prep"}, "day_total_lpg": 0.9},
            "saturday":  {"breakfast": {"meal": f"{'Poha' if has_poha else 'Paratha'}", "lpg": 0.2, "cook_time": "10 mins", "tip": "Weekend start"}, "lunch": {"meal": f"{'Channa' if has_channa else 'Dal'} + {'rice' if has_rice else 'bread'}", "lpg": 0.55, "cook_time": "30 mins", "tip": "Elaborate cooking ok"}, "dinner": {"meal": f"{'Paneer' if has_paneer else 'Egg' if has_eggs else 'Channa'} stir-fry", "lpg": 0.3, "cook_time": "15 mins", "tip": "Weekend treat"}, "day_total_lpg": 1.05},
            "sunday":    {"breakfast": {"meal": f"{'Wheat' if has_wheat else 'Rice'} pancakes or paratha", "lpg": 0.3, "cook_time": "20 mins", "tip": "Sunday brunch"}, "lunch": {"meal": f"{'Dal' if has_dal else 'Channa'} khichdi (one-pot)", "lpg": 0.35, "cook_time": "20 mins", "tip": "Efficient & tasty"}, "dinner": {"meal": "No-cook salad with bread", "lpg": 0.0, "cook_time": "0 mins", "tip": "Stretch that cylinder!"}, "day_total_lpg": 0.65},
        }
    }


@app.post("/save-input")
async def save_input(req: SaveInputRequest):
    try:
        csv_file = Path(__file__).parent / "user_inputs.csv"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row = {
            "timestamp": timestamp,
            "cylinder_level": req.cylinder_level,
            "diet_preference": req.diet_preference,
            "family_members": req.family_members,
            "days_until_cylinder": req.days_until_cylinder,
            "ingredients": req.ingredients,
        }
        file_exists = csv_file.exists()
        with open(csv_file, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=row.keys())
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)
        return {"status": "success", "message": "Input saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save input: {e}")


@app.get("/foods")
def get_foods():
    """Return the full food database as JSON — useful for the frontend."""
    return {"foods": ALL_FOODS}


@app.get("/health")
def health():
    return {"status": "ok"}