import { useState } from 'react'
import './ResultsDisplay.css'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
}
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' }

const LPG_BAR_MAX = { low: 1.5, medium: 2.5, full: 4.0 }

function LpgBar({ value, max }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct > 85 ? '#E24B4A' : pct > 60 ? '#EF9F27' : '#639922'
  return (
    <div className="lpg-bar-track">
      <div className="lpg-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function MealCard({ type, meal }) {
  if (!meal) return null
  return (
    <div className="meal-card">
      <div className="meal-header">
        <span className="meal-icon">{MEAL_ICONS[type]}</span>
        <span className="meal-type">{type}</span>
        <span className="meal-lpg">{meal.lpg ?? 0} units</span>
      </div>
      <div className="meal-name">{meal.meal}</div>
      {meal.cook_time && meal.cook_time !== '0 mins' && (
        <div className="meal-meta">⏱ {meal.cook_time}</div>
      )}
      {meal.tip && <div className="meal-tip">💡 {meal.tip}</div>}
    </div>
  )
}

export default function ResultsDisplay({ results, loading, error, formData, onReset }) {
  const [activeDay, setActiveDay] = useState('monday')

  const cylinderLevel = formData?.cylinderLevel || 'medium'
  const barMax = LPG_BAR_MAX[cylinderLevel] || 2.5

  if (loading) {
    return (
      <div className="results-loading">
        <div className="flame-anim">🔥</div>
        <p>Building your 7-day meal plan…</p>
        <p className="loading-sub">Calculating LPG savings for {formData?.familyMembers || '?'} people</p>
      </div>
    )
  }

  if (error && !results) {
    return (
      <div className="results-error">
        <h3>⚠️ Something went wrong</h3>
        <p>{error}</p>
        <button onClick={onReset} className="reset-btn">Try Again</button>
      </div>
    )
  }

  if (!results) return null

  const plan = results.weekly_plan || {}
  const dayData = plan[activeDay] || {}

  // Calculate weekly total LPG
  const weeklyTotal = DAYS.reduce((sum, d) => sum + (plan[d]?.day_total_lpg || 0), 0)

  return (
    <div className="results-wrapper">

      {/* Header */}
      <div className="results-header">
        <div className="results-title">
          <span className="flame-sm">🔥</span>
          <h2>Your 7-Day Meal Plan</h2>
        </div>
        <button onClick={onReset} className="new-plan-btn">← New Plan</button>
      </div>

      {/* Summary strip */}
      {results.summary && (
        <div className="summary-strip">
          <p>{results.summary}</p>
          {results.lpg_saved_estimate && (
            <span className="lpg-badge">⚡ {results.lpg_saved_estimate}</span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{weeklyTotal.toFixed(1)}</div>
          <div className="stat-label">Total LPG units (7 days)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(weeklyTotal / 7).toFixed(2)}</div>
          <div className="stat-label">Avg LPG per day</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{results.daily_lpg_budget || '—'}</div>
          <div className="stat-label">Daily budget</div>
        </div>
      </div>

      {/* Day selector */}
      <div className="day-tabs">
        {DAYS.map(d => {
          const dayLpg = plan[d]?.day_total_lpg || 0
          const pct = Math.min((dayLpg / barMax) * 100, 100)
          const dot = pct > 85 ? 'dot-red' : pct > 60 ? 'dot-yellow' : 'dot-green'
          return (
            <button
              key={d}
              className={`day-tab ${activeDay === d ? 'active' : ''}`}
              onClick={() => setActiveDay(d)}
            >
              <span className={`day-dot ${dot}`} />
              <span className="day-short">{DAY_LABELS[d]}</span>
              <span className="day-lpg-num">{dayLpg.toFixed(1)}</span>
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      <div className="day-detail">
        <div className="day-detail-header">
          <h3>{activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}</h3>
          <div className="day-lpg-info">
            <span>{dayData.day_total_lpg?.toFixed(2) || '0'} / {barMax} units</span>
            <LpgBar value={dayData.day_total_lpg || 0} max={barMax} />
          </div>
        </div>

        <div className="meals-grid">
          {['breakfast', 'lunch', 'dinner'].map(type => {
            const meal = typeof dayData[type] === 'object' ? dayData[type] : null
            return <MealCard key={type} type={type} meal={meal} />
          })}
        </div>
      </div>

      {/* Weekly overview mini-table */}
      <div className="week-overview">
        <h3>Full Week at a Glance</h3>
        <div className="overview-table">
          <div className="ov-row ov-head">
            <span>Day</span>
            <span>Breakfast</span>
            <span>Lunch</span>
            <span>Dinner</span>
            <span>LPG</span>
          </div>
          {DAYS.map(d => {
            const dd = plan[d] || {}
            const lpg = dd.day_total_lpg || 0
            const pct = Math.min((lpg / barMax) * 100, 100)
            const cls = pct > 85 ? 'lpg-red' : pct > 60 ? 'lpg-yellow' : 'lpg-green'
            const breakfastMeal = typeof dd.breakfast === 'object' ? dd.breakfast?.meal : dd.breakfast
            const lunchMeal = typeof dd.lunch === 'object' ? dd.lunch?.meal : dd.lunch
            const dinnerMeal = typeof dd.dinner === 'object' ? dd.dinner?.meal : dd.dinner
            return (
              <div
                key={d}
                className={`ov-row ${activeDay === d ? 'ov-active' : ''}`}
                onClick={() => setActiveDay(d)}
              >
                <span className="ov-day">{DAY_LABELS[d]}</span>
                <span>{breakfastMeal || '—'}</span>
                <span>{lunchMeal || '—'}</span>
                <span>{dinnerMeal || '—'}</span>
                <span className={`ov-lpg ${cls}`}>{lpg.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommended foods */}
      {results.recommended_foods?.length > 0 && (
        <div className="section-card">
          <h3>✅ Best Foods for Your Situation</h3>
          <div className="food-chips">
            {results.recommended_foods.map((f, i) => {
              const name = typeof f.name === 'string' ? f.name : String(f.name || '')
              const lpg = typeof f.lpg_units === 'number' ? f.lpg_units : 0
              const time = typeof f.cook_time === 'string' ? f.cook_time : ''
              const tip = typeof f.tip === 'string' ? f.tip : ''
              return (
                <div key={i} className="food-chip">
                  <span className="fc-name">{name}</span>
                  <span className="fc-lpg">⚡ {lpg} units</span>
                  {time && time !== '0 mins' && (
                    <span className="fc-time">⏱ {time}</span>
                  )}
                  {tip && <span className="fc-tip">{tip}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Avoid foods */}
      {results.avoid_foods?.length > 0 && (
        <div className="section-card avoid-section">
          <h3>❌ Avoid This Week</h3>
          <ul className="avoid-list">
            {results.avoid_foods.map((f, i) => {
              const name = typeof f.name === 'string' ? f.name : String(f.name || '')
              const reason = typeof f.reason === 'string' ? f.reason : String(f.reason || '')
              return (
                <li key={i}>
                  <span className="avoid-name">{name}</span>
                  <span className="avoid-reason">{reason}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="results-footer">
        <button onClick={onReset} className="new-plan-btn-lg">
          🔄 Generate New Plan
        </button>
      </div>
    </div>
  )
}