# SmartFlame AI - Frontend

A React-based frontend for SmartFlame AI - an intelligent cooking recommendation system during LPG shortages.

## Features

✨ **Smart Recommendations**
- Smart food recommendations based on LPG cylinder level
- Foods to avoid during shortages
- Precise cooking time calculations

👥 **Personalization**
- Diet preference selection (Vegetarian/Non-Vegetarian/Both)
- Family members count config
- Track days left for new cylinder delivery
- Custom ingredient input

📅 **Meal Planning**
- Optional 7-day weekly meal plan generation
- Optimized for fuel efficiency

🎨 **User Experience**
- Clean, modern UI with Vite + React
- Responsive design (mobile-friendly)
- Real-time form validation
- Loading and error states
- Beautiful gradient design with flame theme

## Project Structure

```
src/
├── components/
│   ├── RecommendationForm.jsx    # Main input form component
│   └── ResultsDisplay.jsx         # Results display component
├── styles/
│   ├── RecommendationForm.css    # Form styling
│   └── ResultsDisplay.css         # Results styling
├── App.jsx                        # Main app component
├── App.css                        # Global app styling
├── index.css                      # Base styles
└── main.jsx                       # Entry point
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Edit `.env.local` if your backend runs on a different URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## API Integration

The frontend expects a FastAPI backend running at `http://localhost:8000` with the following endpoint:

### POST `/recommend`
**Request:**
```json
{
  "cylinderLevel": "medium",
  "dietType": "veg",
  "familyMembers": 4,
  "daysLeftForNewCylinder": 7,
  "ingredients": "dal, rice, onion, tomato",
  "weeklyPlan": false
}
```

**Response:**
```json
{
  "recommended": ["Dal", "Rice", "Vegetable Curry"],
  "avoid": ["Biryani", "Heavy rice dishes"],
  "cook_times": {
    "Dal": "20 minutes for 100g",
    "Rice": "15 minutes for 100g"
  },
  "weekly_plan": { ... },
  "summary": "..."
}
```

## Features Implemented

### Form Features
- ✅ Cylinder level selector (Low/Medium/Full)
- ✅ Diet type selection (Veg/Non-Veg/Both)
- ✅ Family members slider (1-20)
- ✅ Days until new cylinder numeric input
- ✅ Ingredients textarea with validation
- ✅ Weekly meal plan checkbox
- ✅ Form validation with error messages
- ✅ Submit button with loading state

### Results Display
- ✅ Recommended foods list
- ✅ Foods to avoid warning list
- ✅ Cooking time calculator
- ✅ 7-day weekly meal plan (if requested)
- ✅ Summary section
- ✅ Loading spinner
- ✅ Error handling
- ✅ Reset/new recommendation button

## Styling Features

- 🔥 Orange flame-themed color scheme (#ff6b35)
- 📱 Fully responsive (mobile, tablet, desktop)
- ✨ Smooth transitions and animations
- 🎯 Gradient backgrounds
- 🎨 Color-coded cards (green for good, red for avoid)
- ♿ Accessible form controls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized React components with proper re-render prevention
- CSS Grid for responsive layouts
- Lazy loading ready for images
- Minimal dependencies for fast load times

## Development Notes

### Component Communication
- `App.jsx` manages overall state
- `RecommendationForm` handles user input
- `ResultsDisplay` shows API results
- Data flows through props and callbacks

### Error Handling
- Form validation on submit
- API error handling with user-friendly messages
- Missing backend instance handling

### Future Enhancements
- Offline mode with cached responses
- Multi-language support (Hindi/Punjabi)
- History of past recommendations
- User preferences persistence
- Dark mode toggle

## License

MIT License - See LICENSE file for details

## Support

For issues or questions about the frontend, please check:
1. Backend is running at the configured API_BASE_URL
2. Environment variables are properly set
3. All dependencies are installed with `npm install`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with proper commit messages

---

Made with ❤️ for SmartFlame AI Project
