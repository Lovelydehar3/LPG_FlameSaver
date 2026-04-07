import '../styles/ResultsDisplay.css'

function ResultsDisplay({ results, loading, error, onReset }) {
  if (loading) {
    return (
      <div className="results-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting smart recommendations for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="error-alert">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={onReset} className="reset-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>📋 Your Recommendations</h2>
        <button onClick={onReset} className="close-results">×</button>
      </div>

      <div className="results-grid">
        {/* Recommended Foods */}
        {results.recommended && results.recommended.length > 0 && (
          <div className="result-card recommended">
            <h3>✅ Recommended Foods</h3>
            <ul className="food-list">
              {results.recommended.map((food, index) => (
                <li key={index} className="food-item">
                  <span className="food-icon">🟢</span>
                  <span className="food-name">{food}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Foods to Avoid */}
        {results.avoid && results.avoid.length > 0 && (
          <div className="result-card avoid">
            <h3>❌ Avoid These Foods</h3>
            <ul className="food-list">
              {results.avoid.map((food, index) => (
                <li key={index} className="food-item">
                  <span className="food-icon">🔴</span>
                  <span className="food-name">{food}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cook Times */}
        {results.cook_times && Object.keys(results.cook_times).length > 0 && (
          <div className="result-card cook-times">
            <h3>⏱️ Cooking Times</h3>
            <div className="cook-times-list">
              {Object.entries(results.cook_times).map(([food, time], index) => (
                <div key={index} className="cook-time-item">
                  <span className="time-food">{food}</span>
                  <span className="time-value">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Plan */}
        {results.weekly_plan && (
          <div className="result-card weekly-plan">
            <h3>📅 7-Day Meal Plan</h3>
            <div className="weekly-plan-content">
              {Object.entries(results.weekly_plan).map(([day, meals], index) => (
                <div key={index} className="day-plan">
                  <h4>{day}</h4>
                  <ul>
                    {Array.isArray(meals) ? (
                      meals.map((meal, idx) => (
                        <li key={idx}>{meal}</li>
                      ))
                    ) : (
                      <li>{meals}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Section */}
        {results.summary && (
          <div className="result-card summary">
            <h3>💡 Summary</h3>
            <p>{results.summary}</p>
          </div>
        )}
      </div>

      <div className="results-footer">
        <button onClick={onReset} className="new-search-btn">
          🔄 Get New Recommendations
        </button>
      </div>
    </div>
  )
}

export default ResultsDisplay
