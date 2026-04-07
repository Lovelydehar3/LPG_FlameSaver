# API Contract Specification

## Overview

This document specifies the API contract that the backend must implement for the SmartFlame AI frontend to work correctly.

---

## Base URL

```
http://localhost:8000
```

(Configurable in `.env.local` via `VITE_API_BASE_URL`)

---

## Endpoints

### 1. POST /recommend

Generates smart cooking recommendations based on user input.

#### Request

**Method:** `POST`

**Content-Type:** `application/json`

**Body:**
```json
{
  "cylinderLevel": "medium",
  "dietType": "veg",
  "familyMembers": 4,
  "daysLeftForNewCylinder": 7,
  "ingredients": "dal, rice, onion, tomato, potato",
  "weeklyPlan": false
}
```

#### Request Field Specifications

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `cylinderLevel` | string | Yes | "low", "medium", "full" | Current LPG cylinder level |
| `dietType` | string | Yes | "veg", "nonveg", "both" | User's diet preference |
| `familyMembers` | integer | Yes | 1-20 | Number of people to cook for |
| `daysLeftForNewCylinder` | integer | Yes | 0-90 | Days until new cylinder arrives |
| `ingredients` | string | Yes | Comma-separated | Available ingredients |
| `weeklyPlan` | boolean | No | true/false | Generate 7-day meal plan |

#### Response (Success)

**Status Code:** `200 OK`

**Content-Type:** `application/json`

**Body:**
```json
{
  "recommended": [
    "Dal (lentils)",
    "Rice",
    "Vegetable Curry",
    "Bread/Roti"
  ],
  "avoid": [
    "Biryani",
    "Heavy curries",
    "Deep fried items"
  ],
  "cook_times": {
    "Dal (lentils)": "20 minutes for 100g",
    "Rice": "15 minutes for 100g",
    "Vegetable Curry": "25 minutes for 300g"
  },
  "weekly_plan": {
    "Monday": [
      "Breakfast: Dal Rice with Roti",
      "Lunch: Vegetable Curry with Rice",
      "Dinner: Simple Dal Khichdi"
    ],
    "Tuesday": [
      "Breakfast: Light Upma",
      "Lunch: Lentil Soup with Bread",
      "Dinner: Vegetable Pulao"
    ]
    // ... more days
  },
  "summary": "Based on your cipher level (medium) and 7 days till new cylinder, focus on quick-cooking meals. The recommended foods are optimized for fuel efficiency while maintaining nutrition."
}
```

#### Response Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recommended` | array | Yes | List of 3-8 food item names |
| `avoid` | array | Yes | List of 2-5 food items to skip |
| `cook_times` | object | Yes | Map of food names to cooking time strings |
| `weekly_plan` | object | No | Only if `weeklyPlan: true` in request |
| `summary` | string | Yes | 1-2 sentence summary with AI insights |

#### Weekly Plan Format

```json
{
  "Monday": ["Item 1", "Item 2", "Item 3"],
  "Tuesday": ["Item 1", "Item 2", "Item 3"],
  "Wednesday": ["Item 1", "Item 2", "Item 3"],
  "Thursday": ["Item 1", "Item 2", "Item 3"],
  "Friday": ["Item 1", "Item 2", "Item 3"],
  "Saturday": ["Item 1", "Item 2", "Item 3"],
  "Sunday": ["Item 1", "Item 2", "Item 3"]
}
```

---

## Error Responses

### Missing Required Field

**Status Code:** `400 Bad Request`

```json
{
  "detail": "Missing required field: cylinderLevel"
}
```

### Invalid Field Value

**Status Code:** `422 Unprocessable Entity`

```json
{
  "detail": [
    {
      "loc": ["body", "cylinderLevel"],
      "msg": "value is not a valid enumeration member; permitted: 'low', 'medium', 'full'",
      "type": "type_error.enum"
    }
  ]
}
```

### Internal Server Error

**Status Code:** `500 Internal Server Error`

```json
{
  "detail": "Internal server error occurred"
}
```

### API Connection Error

If frontend cannot connect:
```
Error: Failed to fetch from http://localhost:8000/recommend
```

---

## Request Examples

### Example 1: Basic Recommendation (No Weekly Plan)

```json
{
  "cylinderLevel": "low",
  "dietType": "veg",
  "familyMembers": 3,
  "daysLeftForNewCylinder": 5,
  "ingredients": "dal, rice, onion, tomato",
  "weeklyPlan": false
}
```

### Example 2: Full Features (With Weekly Plan)

```json
{
  "cylinderLevel": "medium",
  "dietType": "both",
  "familyMembers": 6,
  "daysLeftForNewCylinder": 10,
  "ingredients": "dal, rice, chicken, onion, tomato, potato, spinach, carrots",
  "weeklyPlan": true
}
```

### Example 3: Low Cylinder Urgency

```json
{
  "cylinderLevel": "low",
  "dietType": "nonveg",
  "familyMembers": 5,
  "daysLeftForNewCylinder": 2,
  "ingredients": "rice, flour, eggs, vegetables",
  "weeklyPlan": false
}
```

---

## Response Examples

### Example 1: Low Cylinder Response

```json
{
  "recommended": [
    "Rice with water",
    "Simple dal",
    "Boiled vegetables"
  ],
  "avoid": [
    "Biryani",
    "Heavy curries",
    "Deep frying"
  ],
  "cook_times": {
    "Simple Dal": "18 minutes",
    "Boiled Rice": "12 minutes"
  },
  "summary": "With only 2 days left, minimize cooking time and fuel. Focus on boiled/steamed preparations."
}
```

### Example 2: Full Features Response

```json
{
  "recommended": [
    "Dal varieties",
    "Rice preparations",
    "Vegetable curries",
    "Bread/Roti",
    "Simple chicken curry"
  ],
  "avoid": [
    "Biryani",
    "Fried rice",
    "Heavy meat dishes"
  ],
  "cook_times": {
    "Dal Tadka": "25 minutes for 2 servings",
    "Plain Rice": "15 minutes for 2 cups",
    "Simpl Chicken Curry": "30 minutes for 500g"
  },
  "weekly_plan": {
    "Monday": [
      "Breakfast: Light Upma or Bread",
      "Lunch: Dal with Rice",
      "Dinner: Vegetable Curry with Roti"
    ],
    "Tuesday": [
      "Breakfast: Simple Bread with Tea",
      "Lunch: Lentil Soup with Vegetables",
      "Dinner: Rice with Dal"
    ]
    // ... 5 more days
  },
  "summary": "You have sufficient cylinder capacity. Mix quick-cooking dals with simple vegetables and bread for balanced, fuel-efficient meals throughout the week."
}
```

---

## CORS Configuration

The backend **MUST** enable CORS for requests from `http://localhost:5173` (or production domain).

### Required CORS Headers
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### FastAPI Example
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Request/Response Flow

```
Frontend (React)
    ↓
POST /recommend
    ↓
Backend (FastAPI)
    ├─ Parse request
    ├─ Validate fields
    ├─ Call AI/Claude API
    ├─ Fetch food database
    ├─ Format response
    └─ Return JSON
    ↓
Frontend receives response
    ↓
ResultsDisplay renders results
```

---

## Validation Rules

### Frontend Validation (Before Sending)
- ✅ All required fields present
- ✅ cylinderLevel is one of: low, medium, full
- ✅ dietType is one of: veg, nonveg, both
- ✅ familyMembers is 1-20
- ✅ daysLeftForNewCylinder is 0-90
- ✅ ingredients is not empty
- ✅ weeklyPlan is boolean

### Backend Validation (Required)
- ✅ Validate all input types and ranges
- ✅ Reject invalid enum values
- ✅ Check for missing required fields
- ✅ Return meaningful error messages

---

## Performance Requirements

- **Response Time:** < 3 seconds for typical requests
- **Timeout:** Frontend will timeout after 30 seconds
- **Rate Limiting:** No strict limit for MVP

---

## Testing the API

### Using cURL
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "cylinderLevel": "medium",
    "dietType": "veg",
    "familyMembers": 4,
    "daysLeftForNewCylinder": 7,
    "ingredients": "dal, rice",
    "weeklyPlan": false
  }'
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:8000/recommend`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "cylinderLevel": "medium",
  "dietType": "veg",
  "familyMembers": 4,
  "daysLeftForNewCylinder": 7,
  "ingredients": "dal, rice",
  "weeklyPlan": false
}
```

### Using JavaScript Fetch
```javascript
fetch('http://localhost:8000/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cylinderLevel: 'medium',
    dietType: 'veg',
    familyMembers: 4,
    daysLeftForNewCylinder: 7,
    ingredients: 'dal, rice',
    weeklyPlan: false
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

---

## Status Codes Reference

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Valid request, response returned |
| 400 | Bad Request | Missing/invalid fields |
| 422 | Unprocessable Entity | Field validation failed |
| 500 | Server Error | Backend error |
| Network Error | No connection | Backend not running |

---

## Future API Endpoints (Optional)

These endpoints could be added later:

```
POST /weekly-plan        - Dedicated weekly plan endpoint
POST /cook-times        - Detailed cooking times
GET  /foods             - Get all available foods
POST /favorites         - Save favorite recommendations
GET  /history           - Get recommendation history
```

---

## Implementation Checklist for Backend Team

Before deploying:

- [ ] ✅ POST /recommend endpoint created
- [ ] ✅ All required request fields validated
- [ ] ✅ Response format matches spec exactly
- [ ] ✅ CORS headers configured
- [ ] ✅ Error messages are helpful
- [ ] ✅ No sensitive data in responses
- [ ] ✅ Response time < 3 seconds
- [ ] ✅ Tested with example requests
- [ ] ✅ Claude/OpenAI API integration working
- [ ] ✅ Food database loaded
- [ ] ✅ Logging/monitoring set up

---

## Notes for Frontend Developers

- Always check `.env.local` for correct API URL
- Handle network errors gracefully
- Display specific error messages from backend
- Log API responses in development
- Test with different input combinations

---

## Contact & Support

For API specification questions or issues:
1. Check this document first
2. Verify backend implementation against spec
3. Test endpoints with Postman/cURL
4. Check browser console for error details

---

**API Contract Version:** 1.0.0  
**Last Updated:** 2026-04-07  
**Status:** Ready for Implementation
