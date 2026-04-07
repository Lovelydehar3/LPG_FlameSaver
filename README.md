# 🔥 SmartFlame AI

> **Smart cooking recommendations during LPG shortages — powered by Claude AI**

SmartFlame AI helps families make the most of their remaining LPG by recommending fuel-efficient meals, calculating exact cook times, and generating weekly meal plans — all personalized to what ingredients you actually have.

---


## 🧠 How It Works

```
React Frontend (Vite)
       ↓  POST /recommend
  FastAPI Backend (Python)
       ↓              ↓
  foods.csv       API (Anthropic)
  (ground truth)  (AI recommendations)
       ↓
  JSON response → UI renders results
```

---

## 🏗️ Project Structure

```
smartflame-ai/
│
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── RecommendationForm.jsx
│   │   │   └── ResultsDisplay.jsx
│   │   └── styles/
│   ├── .env                   # VITE_API_BASE_URL
│   └── package.json
│
├── backend/                   # FastAPI + Python
│   ├── main.py
│   ├── food.csv              # Verified food fuel database
│   ├── .env                   # ANTHROPIC_API_KEY
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Python + FastAPI |
| Data | CSV (Pandas) |
| Styling | Custom CSS |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Anthropic API key → [Get one here](https://console.anthropic.com/)

---

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn anthropic pandas python-dotenv

# Create your .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Run the server
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 3 API Reference

### `POST /recommend`

Takes the user's situation and returns personalized cooking recommendations.

**Request Body:**
```json
{
  "cylinderLevel": "low",
  "dietType": "veg",
  "familyMembers": 4,
  "daysLeftForNewCylinder": 5,
  "ingredients": "dal, rice, onion, tomato",
  "weeklyPlan": false
}
```

**Response:**
```json
{
  "recommended": ["Dal", "Khichdi", "Poha"],
  "avoid": ["Biryani", "Chicken Curry"],
  "cook_times": {
    "Dal": "20 mins for 400g",
    "Khichdi": "20 mins for 500g"
  },
  "weekly_plan": {
    "Monday": ["Breakfast: Poha", "Lunch: Dal Rice", "Dinner: Roti Sabzi"]
  },
  "summary": "With a low cylinder and 5 days remaining, focus on one-pot meals..."
}
```

### `GET /foods`

Returns the full food database.

---

## 🗃️ Food Database (`foods.csv`)

The CSV is the **ground truth** — Claude uses only this data for cook times, preventing hallucination.

| Column | Description |
|--------|-------------|
| `food` | Food name |
| `cook_time_min_per_100g` | Minutes to cook per 100g |
| `lpg_units` | LPG consumed per 100g |
| `category` | protein / carbs / breakfast / etc. |
| `avoid_during_shortage` | Yes / No / Preferred |
| `diet_type` | veg / nonveg / both |

---

## ✨ Features

- **Fuel-aware recommendations** — adjusts urgency based on cylinder level + days remaining
- **Diet filtering** — vegetarian, non-vegetarian, or both
- **Family-size scaling** — quantities adapt to your household
- **Verified cook times** — AI uses only your CSV data, no hallucination
- **Weekly meal planner** — optional 7-day plan on demand
- **Smart urgency logic** — CRITICAL / MODERATE / NORMAL mode

---

---

## 🤝 Team

| Name | Role |
|------|------|
| **Karan Sharma** | Backend — FastAPI |
| **Lovepreet Singh** | Frontend — React UI, form & results display |
| **Mohammed** | Data & AI — Food database|

**Team TriJot** 

---

## 💡 Panelist Q&A

**"If the war ends, is this useless?"**
Natural resources are always limited — electricity, biogas, wood, water all have fuel costs. SmartFlame extends to any fuel source. LPG is just today's crisis.

**"Why not just Google it?"**
Google gives generic recipes. SmartFlame gives a personalized plan based on *your* ingredients, *your* cylinder level, and *your* family size — in one response.


---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
  Made by Team TriJot
</div>
