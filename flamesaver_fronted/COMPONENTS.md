# Component Documentation

## Overview

SmartFlame AI frontend consists of three main components working together to create a seamless user experience for getting smart cooking recommendations.

---

## Components Architecture

```
App (State Management)
├── RecommendationForm (User Input)
└── ResultsDisplay (Results Display)
```

---

## 1. RecommendationForm Component

**File:** `src/components/RecommendationForm.jsx`

### Purpose
Collects user input for generating smart cooking recommendations.

### Props
```jsx
{
  onSubmit: (formData) => void  // Called when form is submitted
}
```

### State
```jsx
{
  cylinderLevel: 'medium',           // "low" | "medium" | "full"
  dietType: 'veg',                   // "veg" | "nonveg" | "both"
  familyMembers: 4,                  // 1-20
  daysLeftForNewCylinder: 7,         // 0-90
  ingredients: '',                   // string (comma-separated)
  weeklyPlan: false                  // boolean
}
```

### Features
- **Cylinder Level Selector:** Dropdown with three options
- **Diet Type Radio Buttons:** Three mutually exclusive options
- **Family Members Slider:** Range input with display value
- **Days Until Cylinder:** Number input
- **Ingredients Textarea:** Multi-line text input
- **Weekly Plan Checkbox:** Optional meal planning
- **Form Validation:** Client-side validation before submit

### Validation Rules
```javascript
- ingredients: Required, at least 1 character
- familyMembers: Must be between 1-20
- daysLeftForNewCylinder: Cannot be negative
```

### Styling
**File:** `src/styles/RecommendationForm.css`

Key Classes:
- `.form-container` - Outer wrapper
- `.recommendation-form` - Main form container
- `.form-group` - Individual input groups
- `.form-select` - Dropdown styling
- `.radio-group` - Radio button container
- `.form-range` - Slider styling
- `.submit-btn` - Orange gradient button

### Usage Example

```jsx
import RecommendationForm from './components/RecommendationForm'

function App() {
  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData)
    // Send to API
  }

  return <RecommendationForm onSubmit={handleSubmit} />
}
```

### Modified Form Fields

To add a new form field:

1. **Add to state initialization:**
   ```jsx
   const [formData, setFormData] = useState({
     // ... existing
     newField: 'default'
   })
   ```

2. **Add input element in JSX:**
   ```jsx
   <div className="form-group">
     <label htmlFor="newField">Field Label</label>
     <input
       id="newField"
       name="newField"
       value={formData.newField}
       onChange={handleChange}
     />
   </div>
   ```

3. **Add validation (if needed):**
   ```jsx
   const validateForm = () => {
     const newErrors = {}
     if (!formData.newField) {
       newErrors.newField = 'Error message'
     }
     return newErrors
   }
   ```

---

## 2. ResultsDisplay Component

**File:** `src/components/ResultsDisplay.jsx`

### Purpose
Displays recommendations and results from the backend API.

### Props
```jsx
{
  results: {
    recommended: string[],
    avoid: string[],
    cook_times: { [key: string]: string },
    weekly_plan?: { [key: string]: string[] },
    summary?: string
  } | null,
  loading: boolean,           // Show loading spinner
  error: string | null,       // Show error message
  onReset: () => void        // Called to start new search
}
```

### Features

#### Loading State
- Shows animated spinner
- Displays "Getting recommendations..." message
- Prevents user interaction

#### Error State
- Shows error alert with red background
- Displays error message
- "Try Again" button to retry

#### Results Display
- **Recommended Foods Card:** Green icons with food list
- **Foods to Avoid Card:** Red warning icons
- **Cooking Times Card:** Blue card with time breakdowns
- **Weekly Plan Card:** Purple card with 7-day meal plan
- **Summary Card:** Orange card with AI insights

### Card Styling

Each result card:
- White background with border
- Color-coded top border
- Hover animation (lift effect)
- Responsive grid layout

Colors:
- Recommended: Green (#4caf50)
- Avoid: Red (#d32f2f)
- Cook Times: Blue (#2196f3)
- Weekly Plan: Purple (#9c27b0)
- Summary: Orange (#ff9800)

### Styling
**File:** `src/styles/ResultsDisplay.css`

Key Classes:
- `.results-container` - Main container
- `.result-card` - Individual result cards
- `.result-card.recommended` - Green recommended card
- `.result-card.avoid` - Red avoid card
- `.food-list` - Food items list
- `.loading` - Loading state
- `.error-alert` - Error display

### Usage Example

```jsx
import ResultsDisplay from './components/ResultsDisplay'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleReset = () => {
    setResults(null)
    setError(null)
  }

  return (
    <ResultsDisplay
      results={results}
      loading={loading}
      error={error}
      onReset={handleReset}
    />
  )
}
```

---

## 3. App Component

**File:** `src/App.jsx`

### Purpose
Main application component managing state and API communication.

### State
```jsx
{
  results: null | object,      // API response
  loading: boolean,            // API call in progress
  error: null | string        // Error message
}
```

### Functions

#### handleFormSubmit(formData)
- Called when user submits form
- Sends POST request to backend
- Sets loading state during request
- Handles API response or errors

#### handleReset()
- Clears results and errors
- Returns to form view

### API Communication

**Endpoint:** `POST http://localhost:8000/recommend`

**Request:**
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

**Response:**
```json
{
  "recommended": ["Dal", "Rice"],
  "avoid": ["Biryani"],
  "cook_times": {"Dal": "20 min"},
  "weekly_plan": {...},
  "summary": "..."
}
```

### Error Handling
- Network errors: "Failed to get recommendations..."
- API errors: Status message from server
- Missing fields: Validation errors from RecommendationForm

### Conditional Rendering
```
No results & no loading  → Show RecommendationForm
Loading                  → Show ResultsDisplay with loading=true
Results received         → Show ResultsDisplay with results
Error occurred          → Show ResultsDisplay with error
```

---

## Data Flow

```
User fills form
    ↓
RecommendationForm.onSubmit(formData)
    ↓
App.handleFormSubmit(formData)
    ↓
POST /recommend API call
    ↓
Response received/Error occurred
    ↓
setState(results/error/loading)
    ↓
ResultsDisplay rendered with data
```

---

## Styling Architecture

### Color Scheme
- **Primary:** #ff6b35 (Orange) - Main brand color
- **Secondary:** #ff8c4a (Light Orange) - Hover states
- **Success:** #4caf50 (Green) - Recommended items
- **Danger:** #d32f2f (Red) - Avoid items
- **Info:** #2196f3 (Blue) - Cook times
- **Accent:** #9c27b0 (Purple) - Weekly plan

### Responsive Breakpoints
```css
Mobile:  < 600px   - Single column
Tablet:  600-768px - 2 columns
Desktop: > 768px   - 3+ columns
```

### Typography
- Font: System default (San Francisco, Segoe UI, etc.)
- Heading: 600-700 weight, larger size
- Body: 400 weight, #333 color
- Labels: 600 weight

---

## Common Tasks

### Modify Form Validation

Edit `RecommendationForm.jsx`, find `validateForm()`:
```jsx
const validateForm = () => {
  const newErrors = {}
  
  // Add your validation rules
  if (condition) {
    newErrors.fieldName = 'Error message'
  }
  
  return newErrors
}
```

### Change API Endpoint

Edit `App.jsx`, find `API_BASE_URL`:
```jsx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```

Create `.env.local`:
```
VITE_API_BASE_URL=http://your-api-url
```

### Add New Result Card Type

In `ResultsDisplay.jsx`:
```jsx
{results.newField && (
  <div className="result-card custom">
    <h3>Card Title</h3>
    {/* Display newField data */}
  </div>
)}
```

Add styling in `ResultsDisplay.css`:
```css
.result-card.custom {
  border-top: 4px solid #yourcolor;
}
```

---

## Testing Components

### Test Form Submission
1. Fill all fields
2. Click "Get Recommendations"
3. Verify loading spinner appears
4. Check backend response in console

### Test Error Handling
1. Start with backend stopped
2. Submit form
3. Verify error message displays
4. Click "Try Again"

### Test Results Display
1. Create mock results object
2. Pass to ResultsDisplay as prop
3. Verify all cards render correctly
4. Check responsive layout on mobile

---

## Performance Considerations

### Component Optimization
- RecommendationForm uses `useState` for form state
- Form validation runs only on submit
- Results display only renders when data exists

### Re-render Prevention
- Props are only updated when data changes
- Event handlers use proper closure
- No inline functions in render

### Bundle Size
- React 19.2: ~42KB gzipped
- Vite build: ~15KB gzipped
- Total app: ~60KB gzipped

---

## Accessibility Features

✅ Implemented:
- Semantic HTML (labels with inputs)
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA
- Focus indicators visible
- Error messages linked to inputs

---

## Browser Compatibility

✅ Tested & Supported:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting Components

### Form not submitting
- Check browser console for errors
- Verify validation passes (no error messages)
- Check API endpoint is accessible

### Results not displaying
- Verify API returns expected format
- Check browser console for response
- Compare with ResultsDisplay expected props

### Styling issues
- Clear browser cache
- Restart dev server
- Check CSS imports are correct
- Verify class names match between JSX and CSS

---

## Future Enhancements

- [ ] Add form field animations
- [ ] Implement result filtering
- [ ] Add result export (PDF/CSV)
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Offline mode with caching
- [ ] User preference storage
- [ ] Result history

---

Generated for SmartFlame AI Team
