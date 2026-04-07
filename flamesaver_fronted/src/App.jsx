/* eslint-disable */
import { useState, useEffect } from 'react'

// Food database CSV
const FOOD_DATABASE_CSV = `food,cook_time_min_per_100g,lpg_units,category,avoid_during_shortage,vegetarian
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
Dosa,5,0.08,carbs,No,Yes
Biryani,45,0.8,rice,Yes,No
Fried rice,20,0.35,carbs,Avoid,No
Puri,10,0.4,fried,Yes,Yes`

// Parse CSV food database
const parseFoodDatabase = () => {
  const lines = FOOD_DATABASE_CSV.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      food: values[0],
      cook_time_min_per_100g: parseInt(values[1]),
      lpg_units: parseFloat(values[2]),
      category: values[3],
      avoid_during_shortage: values[4],
      vegetarian: values[5] === 'Yes',
    }
  })
}

const FOODS = parseFoodDatabase()

// Sub-component: Cylinder Level Selector
function CylinderSelector({ value, onChange }) {
  const options = [
    { label: 'Low', value: 'low', color: 'bg-red-950 border-red-800 text-red-300' },
    { label: 'Medium', value: 'medium', color: 'bg-amber-950 border-amber-700 text-amber-300' },
    { label: 'Full', value: 'full', color: 'bg-emerald-950 border-emerald-800 text-emerald-300' },
  ]

  const getFillWidth = () => {
    const fills = { low: 25, medium: 55, full: 100 }
    return fills[value] || 25
  }

  const getFillColor = () => {
    const colors = { low: 'bg-red-600', medium: 'bg-amber-600', full: 'bg-emerald-600' }
    return colors[value] || 'bg-red-600'
  }

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-3">
        LPG Cylinder Level
      </label>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`py-3 rounded-xl text-xs font-semibold border transition-all ${
              value === opt.value
                ? opt.color
                : 'bg-[#0f0f0f] border-[#2a2a2a] text-neutral-500 hover:border-[#3a3a3a]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="h-1 rounded-full bg-[#1f1f1f] overflow-hidden">
        <div
          className={`h-full ${getFillColor()} transition-all duration-500`}
          style={{ width: `${getFillWidth()}%` }}
        ></div>
      </div>
    </div>
  )
}

// Sub-component: Diet Selector
function DietSelector({ value, onChange }) {
  const options = ['Vegetarian', 'Non-Vegetarian', 'Both']

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-3">
        Diet Preference
      </label>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt.toLowerCase())}
            className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${
              value === opt.toLowerCase()
                ? 'bg-[#7c2d12] border-[#e85d04]/40 text-[#e85d04]'
                : 'bg-[#0f0f0f] border-[#2a2a2a] text-neutral-500 hover:border-[#3a3a3a]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// Sub-component: Food Card
function FoodCard({ food }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
      <div className="text-sm font-semibold text-[#f5f5f5]">{food.name}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{food.cook_time} min</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] bg-[#052e16] text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full">
          LPG: {food.lpg_units}
        </span>
      </div>
      {food.tip && <div className="italic text-[11px] text-amber-500/70 mt-2">{food.tip}</div>}
    </div>
  )
}

// Sub-component: Weekly Plan
function WeeklyPlan({ plan, isMobile }) {
  if (!plan) return null

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  if (isMobile) {
    return (
      <div className="space-y-2">
        {days.map((day, idx) => (
          <details key={day} className="group">
            <summary className="cursor-pointer flex items-center gap-3 py-3 px-4 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl hover:border-[#2a2a2a] transition-colors">
              <div className="text-xs font-bold text-[#e85d04] uppercase w-12">{dayShort[idx]}</div>
              <div className="text-xs text-neutral-500 group-open:hidden">Click to expand</div>
            </summary>
            <div className="mt-2 text-xs text-neutral-400 space-y-1 pl-4">
              {plan[day] && (
                <>
                  <div>Breakfast: {plan[day].breakfast}</div>
                  <div>Lunch: {plan[day].lunch}</div>
                  <div>Dinner: {plan[day].dinner}</div>
                </>
              )}
            </div>
          </details>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {days.map((day, idx) => (
        <div key={day} className="flex gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
          <div className="text-xs font-bold text-[#e85d04] uppercase w-12 flex-shrink-0">{dayShort[idx]}</div>
          <div className="flex-1 grid grid-cols-3 gap-4 text-xs text-neutral-400">
            <div>{plan[day]?.breakfast || '-'}</div>
            <div>{plan[day]?.lunch || '-'}</div>
            <div>{plan[day]?.dinner || '-'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Sub-component: Results Panel
function ResultsPanel({ results, loading, error, weeklyPlanEnabled, isMobile }) {
  if (!results && !loading && !error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="grid grid-cols-3 gap-2 mb-4 justify-center">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#1f1f1f]"></div>
            ))}
          </div>
          <p className="text-sm text-neutral-500">Your recommendations will appear here</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 space-y-3">
        <div className="h-4 bg-[#1f1f1f] rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-[#1f1f1f] rounded animate-pulse w-1/2"></div>
        <div className="h-4 bg-[#1f1f1f] rounded animate-pulse w-2/3"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#1a0000] border border-red-900 rounded-xl p-4 text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      {results.summary && (
        <div className="bg-gradient-to-r from-[#1a0e00] to-[#0a0a0a] border border-[#3d1f00] rounded-xl px-5 py-4">
          <p className="text-sm text-amber-600">{results.summary}</p>
        </div>
      )}

      {/* Recommended Foods */}
      {results.recommended && results.recommended.length > 0 && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 className="text-sm font-semibold text-[#f5f5f5]">Recommended</h3>
            <span className="ml-auto text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full">
              {results.recommended.length} foods
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.recommended.map((food, idx) => (
              <FoodCard key={idx} food={food} />
            ))}
          </div>
        </div>
      )}

      {/* Foods to Avoid */}
      {results.avoid && results.avoid.length > 0 && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <h3 className="text-sm font-semibold text-[#f5f5f5]">Avoid</h3>
            <span className="ml-auto text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">
              {results.avoid.length} foods
            </span>
          </div>
          <div className="space-y-0">
            {results.avoid.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-red-300">{item.name}</div>
                  <div className="text-xs text-neutral-600">{item.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan */}
      {weeklyPlanEnabled && results.weekly_plan && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-4">7-Day Meal Plan</h3>
          <WeeklyPlan plan={results.weekly_plan} isMobile={isMobile} />
        </div>
      )}
    </div>
  )
}

// Main App Component
export default function App() {
  const [cylinderLevel, setCylinderLevel] = useState('medium')
  const [dietPreference, setDietPreference] = useState('both')
  const [familyMembers, setFamilyMembers] = useState(4)
  const [daysUntilCylinder, setDaysUntilCylinder] = useState(7)
  const [ingredients, setIngredients] = useState('')
  const [weeklyPlan, setWeeklyPlan] = useState(false)
  
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ingredientError, setIngredientError] = useState('')
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!ingredients.trim()) {
      setIngredientError('Please enter at least one ingredient')
      return
    }
    setIngredientError('')
    
    setLoading(true)
    setError(null)
    
    try {
      const systemPrompt = `You are an expert nutritionist and fuel efficiency advisor during LPG shortages. 
      
Food database: ${FOOD_DATABASE_CSV}

You MUST:
1. Filter recommendations by diet preference: "${dietPreference}"
2. Adjust portions for ${familyMembers} people
3. Prioritize lower LPG-unit foods when cylinder is "${cylinderLevel}"
4. ${weeklyPlan ? 'Generate a detailed 7-day meal plan' : 'Do NOT generate a weekly plan'}
5. Return ONLY valid JSON with NO markdown, NO preamble, NO explanation
6. Use this exact JSON format:
{
  "recommended": [{"name": "food", "cook_time": "X min", "lpg_units": 0.3, "tip": "optional"}],
  "avoid": [{"name": "food", "reason": "explanation"}],
  "summary": "2-3 sentence summary",
  "weekly_plan": ${weeklyPlan ? '{"monday": {"breakfast": "...", "lunch": "...", "dinner": "..."}, ...}' : 'null'}
}`

      const userMessage = `I have these ingredients available: ${ingredients}
My family size: ${familyMembers}
Days until new cylinder: ${daysUntilCylinder}
Diet preference: ${dietPreference}
Current cylinder level: ${cylinderLevel}

Please analyze and give me fuel-efficient cooking recommendations.`

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!apiKey) {
        setError('API key not configured. Set VITE_ANTHROPIC_API_KEY in .env.local')
        setLoading(false)
        return
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'API request failed')
      }

      const data = await response.json()
      const content = data.content[0].text

      try {
        const parsed = JSON.parse(content)
        setResults(parsed)
      } catch (parseErr) {
        setError('AI returned an unexpected response. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Failed to get recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#f5f5f5' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-lg bg-[#e85d04] flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(232, 93, 4, 0.15)' }}
            >
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold font-[Syne]">
              <span style={{ color: '#f5f5f5' }}>SmartFlame</span>
              <span style={{ color: '#e85d04' }}>AI</span>
            </h1>
          </div>
          <p className="text-sm text-neutral-500">Fuel-efficient cooking during LPG shortage</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          {/* Form Column */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Card */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 space-y-6">
                <CylinderSelector value={cylinderLevel} onChange={setCylinderLevel} />
                
                <DietSelector value={dietPreference} onChange={setDietPreference} />
                
                {/* Family Members */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-3">
                    Family Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={familyMembers}
                    onChange={e => setFamilyMembers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl text-[#f5f5f5] placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-[#e85d04]/30 focus:border-[#e85d04]/50 transition-all duration-200 text-xl font-bold text-center py-4"
                    placeholder="4"
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">Number of people to cook for</p>
                </div>

                {/* Days Until Cylinder */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-3">
                    Days Until Next Cylinder
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysUntilCylinder}
                    onChange={e => setDaysUntilCylinder(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl text-[#f5f5f5] placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-[#e85d04]/30 focus:border-[#e85d04]/50 transition-all duration-200 text-xl font-bold text-center py-4"
                    placeholder="7"
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">Used to plan fuel distribution across days</p>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-3">
                    Ingredients You Have
                  </label>
                  <textarea
                    rows={isMobile ? 3 : 4}
                    value={ingredients}
                    onChange={e => setIngredients(e.target.value.slice(0, 300))}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl text-[#f5f5f5] placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-[#e85d04]/30 focus:border-[#e85d04]/50 transition-all duration-200 resize-none p-3"
                    placeholder="dal, rice, eggs, onion, tomato, paneer..."
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {ingredientError && <span className="text-red-400 text-xs">{ingredientError}</span>}
                    <span className="text-xs text-neutral-500 ml-auto">{ingredients.length} / 300</span>
                  </div>
                </div>

                {/* Weekly Plan Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#f5f5f5]">Generate 7-Day Meal Plan</p>
                    <p className="text-xs text-neutral-500">AI creates a full week of fuel-optimised meals</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeeklyPlan(!weeklyPlan)}
                    className={`w-12 h-6 rounded-full transition-colors ${weeklyPlan ? 'bg-[#e85d04]' : 'bg-[#2a2a2a]'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        weeklyPlan ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d04] hover:bg-[#f48c06] text-white font-semibold rounded-xl py-4 text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                Get Smart Recommendations
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="min-h-96">
            <ResultsPanel
              results={results}
              loading={loading}
              error={error}
              weeklyPlanEnabled={weeklyPlan}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
