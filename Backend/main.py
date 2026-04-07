from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

FOODS_CSV = """food,cook_time_min_per_100g,lpg_units,category,avoid_during_shortage,vegetarian
Dal (lentils),20,0.3,protein,No,Yes
Pasta,12,0.2,carbs,No,Yes
Eggs (boiled),10,0.15,protein,No,No
Rice (plain),18,0.25,carbs,No,Yes
Khichdi,20,0.3,mixed,No,Yes
Oats (instant),5,0.05,carbs,Preferred,Yes
Rajma (kidney beans),40,0.7,protein,Yes,Yes
Chole (chickpeas),35,0.6,protein,Yes,Yes
Aloo sabzi,15,0.2,vegetable,No,Yes
Paneer bhurji,10,0.15,protein,No,Yes
Maggi noodles,4,0.06,carbs,Preferred,Yes
Poha,8,0.1,carbs,No,Yes
Upma,10,0.12,carbs,No,Yes
Chicken curry,30,0.5,protein,No,No
Egg curry,15,0.25,protein,No,No
Bread (store bought),0,0,carbs,Preferred,Yes
Vegetable soup,15,0.2,soup,No,Yes
Idli (steamed),15,0.2,carbs,No,Yes
Dosa,5,0.08,carbs,No,Yes"""

SYSTEM_PROMPT = f"""You are SmartFlame AI, an expert in fuel-efficient cooking during LPG shortages in India.

Food database (CSV):
{FOODS_CSV}

Rules:
- Only recommend foods matching the user diet preference (vegetarian/non-vegetarian/both)
- Cylinder LOW: only recommend lpg_units <= 0.2
- Cylinder MEDIUM: recommend lpg_units <= 0.4
- Cylinder FULL: recommend freely but prefer efficient options
- Adjust portion context based on family_members count
- Use days_until_cylinder to set urgency in the summary

Respond ONLY in valid JSON. No markdown, no code fences. Exact format:
{{
  "recommended": [
    {{"name": "...", "cook_time": "X mins for Y people", "lpg_units": "0.X units", "tip": "..."}}
  ],
  "avoid": [
    {{"name": "...", "reason": "..."}}
  ],
  "summary": "One sentence personalized summary",
  "weekly_plan": {{
    "monday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "tuesday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "wednesday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "thursday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "friday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "saturday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}},
    "sunday": {{"breakfast": "...", "lunch": "...", "dinner": "..."}}
  }}
}}
Only include weekly_plan key if the user requested it."""


class RecommendRequest(BaseModel):
    cylinder_level: str
    diet_preference: str
    family_members: int
    days_until_cylinder: int
    ingredients: str
    weekly_plan: bool = False


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    user_message = f"""
Cylinder level: {req.cylinder_level}
Diet preference: {req.diet_preference}
Family size: {req.family_members} people
Days until new cylinder: {req.days_until_cylinder}
Available ingredients: {req.ingredients}
Generate weekly plan: {req.weekly_plan}
"""
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )
        raw = response.content[0].text.strip()
        result = json.loads(raw)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}