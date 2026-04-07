import { useState } from 'react'
import './App.css'
import RecommendationForm from './components/RecommendationForm'
import ResultsDisplay from './components/ResultsDisplay'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFormSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get recommendations. Please check if the backend is running.'
      )
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
  }

  return (
    <div className="app">
      <div className="app-background"></div>
      <div className="app-content">
        {!results && !loading ? (
          <RecommendationForm onSubmit={handleFormSubmit} />
        ) : (
          <ResultsDisplay
            results={results}
            loading={loading}
            error={error}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

export default App
