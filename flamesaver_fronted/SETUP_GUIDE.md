# SmartFlame AI Frontend - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd flamesaver_fronted
npm install
```

### Step 2: Create Environment File
```bash
cp .env.example .env.local
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📋 Full Setup Instructions

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm 7+ or yarn
- Git

### Complete Installation

1. **Navigate to frontend folder**
   ```bash
   cd flamesaver_fronted
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   
   This installs:
   - React 19.2.4
   - Vite 8 (fast build tool)
   - React DOM 19.2.4
   - ESLint for code quality

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` if needed (default points to localhost:8000):
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Output will show:
   ```
   VITE v8.0.5  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ```

---

## 🎯 Features Implemented

### ✅ Form Features
- **Cylinder Level** - Select Low/Medium/Full
- **Diet Type** - Choose Vegetarian/Non-Vegetarian/Both
- **Family Members** - Slider (1-20 people)
- **Days for Cylinder** - Numeric input for delivery countdown
- **Ingredients** - Multi-line text area with comma separation
- **Weekly Plan** - Optional checkbox for 7-day meal planning
- **Validation** - Real-time error messages

### ✅ Results Display
- **Recommended Foods** - Green checkmark icons
- **Foods to Avoid** - Red warning icons
- **Cooking Times** - Duration calculated per quantity
- **Weekly Plan** - Day-by-day meal suggestions
- **Summary** - AI insights and tips

### ✅ User Experience
- **Responsive Design** - Mobile, tablet, desktop optimized
- **Loading State** - Animated spinner while fetching
- **Error Handling** - User-friendly error messages
- **Color Theme** - Flame orange (#ff6b35) with gradients
- **Smooth Animations** - Transitions on hover and focus

---

## 🛠️ Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

---

## 📁 Project Structure

```
flamesaver_fronted/
├── src/
│   ├── components/
│   │   ├── RecommendationForm.jsx      # Main form component
│   │   └── ResultsDisplay.jsx           # Results component
│   ├── styles/
│   │   ├── RecommendationForm.css      # Form styling
│   │   └── ResultsDisplay.css          # Results styling
│   ├── App.jsx                         # Root component
│   ├── App.css                         # App-level styles
│   ├── index.css                       # Global base styles
│   └── main.jsx                        # React entry point
├── public/                             # Static assets
├── index.html                          # HTML template
├── vite.config.js                      # Vite configuration
├── eslint.config.js                    # ESLint rules
├── package.json                        # Dependencies & scripts
├── .env.example                        # Environment template
└── FRONTEND_README.md                  # Frontend documentation
```

---

## 🔌 API Integration

### Backend Connection

The frontend connects to your backend API at:
```
http://localhost:8000
```

### Expected API Endpoint

**POST** `/recommend`

**Request Body:**
```json
{
  "cylinderLevel": "medium",      // "low" | "medium" | "full"
  "dietType": "veg",              // "veg" | "nonveg" | "both"
  "familyMembers": 4,             // 1-20
  "daysLeftForNewCylinder": 7,    // 0-90
  "ingredients": "dal, rice",     // comma-separated
  "weeklyPlan": false             // true | false
}
```

**Expected Response:**
```json
{
  "recommended": ["Dal", "Rice Curry"],
  "avoid": ["Biryani", "Heavy curries"],
  "cook_times": {
    "Dal": "20 minutes for 100g",
    "Rice": "15 minutes for 100g"
  },
  "weekly_plan": {
    "Monday": ["Dal Rice", "Roti"],
    "Tuesday": ["Vegetable curry", "Bread"]
  },
  "summary": "Recommended fuel-efficient meals..."
}
```

---

## 🎨 Customization

### Change Theme Color

Edit `src/styles/RecommendationForm.css` and `src/styles/ResultsDisplay.css`:

Find: `#ff6b35` (orange)
Replace with: Your color code

### Change Button Text

Edit components in `src/components/`:
- `RecommendationForm.jsx` - Form labels
- `ResultsDisplay.jsx` - Result card titles

### Add More Form Fields

1. Add state in `RecommendationForm.jsx`:
   ```jsx
   const [formData, setFormData] = useState({
     // ... existing fields
     newField: 'defaultValue'
   })
   ```

2. Add input element:
   ```jsx
   <div className="form-group">
     <label htmlFor="newField">New Field</label>
     <input
       id="newField"
       name="newField"
       value={formData.newField}
       onChange={handleChange}
     />
   </div>
   ```

3. Update API call in `App.jsx` - data automatically sent

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'react'"
**Solution:** Run `npm install` again
```bash
npm install
```

### Issue: "Port 5173 is already in use"
**Solution:** Use different port
```bash
npm run dev -- --port 3000
```

### Issue: "API request failed"
**Solutions:**
1. Ensure backend is running on `http://localhost:8000`
2. Check `.env.local` has correct `VITE_API_BASE_URL`
3. Verify CORS is enabled in backend
4. Check browser console for error details (F12)

### Issue: "Styling not loading"
**Solution:** Clear cache and restart
```bash
npm run dev
```

---

## 📝 Git Workflow

```bash
# View all commits
git log --oneline

# Create a new feature branch
git checkout -b feat/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: Add your feature description"

# Push to repository
git push origin feat/your-feature-name
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `style:` - CSS/styling changes
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Adding tests

Example:
```
feat: Add weekly meal plan feature

- Implement 7-day meal plan display
- Add day-by-day meal suggestions
- Update ResultsDisplay component

Closes #123
```

---

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# This generates:
# dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-xxx.css
#   │   └── index-xxx.js
```

### Deploy to Hosting

```bash
# Preview what production build looks like
npm run preview

# Then upload 'dist' folder to your hosting provider
```

---

## 🔍 Code Quality

### Run ESLint
```bash
npm run lint
```

### Fix ESLint Issues Automatically
```bash
npm run lint -- --fix
```

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [MDN Web Docs](https://developer.mozilla.org)

---

## ✨ Next Steps

1. ✅ Frontend is ready!
2. 🔄 Backend team: Implement FastAPI with `/recommend` endpoint
3. 📊 Data team: Prepare food efficiency dataset (CSV)
4. 🤖 AI team: Fine-tune Claude prompts for recommendations
5. 🧪 Testing: Full integration testing with backend

---

## 📞 Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Check browser console (F12 → Console tab)
3. Verify backend is running
4. Check `.env.local` configuration

---

**Happy Coding! 🔥**

Made for SmartFlame AI by Team TriJot
