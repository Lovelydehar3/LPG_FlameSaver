import { useState } from 'react'
import '../styles/RecommendationForm.css'

function RecommendationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    cylinderLevel: 'medium',
    dietType: 'veg',
    familyMembers: 4,
    daysLeftForNewCylinder: 7,
    ingredients: '',
    weeklyPlan: false
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Please enter at least one ingredient'
    }
    
    if (formData.familyMembers < 1 || formData.familyMembers > 20) {
      newErrors.familyMembers = 'Family members must be between 1 and 20'
    }
    
    if (formData.daysLeftForNewCylinder < 0) {
      newErrors.daysLeftForNewCylinder = 'Days cannot be negative'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    onSubmit(formData)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>🔥 SmartFlame AI</h1>
        <p>Smart cooking recommendations during LPG shortage</p>
      </div>

      <form onSubmit={handleSubmit} className="recommendation-form">
        {/* Cylinder Level */}
        <div className="form-group">
          <label htmlFor="cylinderLevel">LPG Cylinder Level</label>
          <select
            id="cylinderLevel"
            name="cylinderLevel"
            value={formData.cylinderLevel}
            onChange={handleChange}
            className="form-select"
          >
            <option value="low">Low (&lt; 25%)</option>
            <option value="medium">Medium (25-75%)</option>
            <option value="full">Full (&gt; 75%)</option>
          </select>
        </div>

        {/* Diet Type */}
        <div className="form-group">
          <label>Diet Preference</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="veg"
                name="dietType"
                value="veg"
                checked={formData.dietType === 'veg'}
                onChange={handleChange}
                className="form-radio"
              />
              <label htmlFor="veg" className="radio-label">🥬 Vegetarian</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="nonveg"
                name="dietType"
                value="nonveg"
                checked={formData.dietType === 'nonveg'}
                onChange={handleChange}
                className="form-radio"
              />
              <label htmlFor="nonveg" className="radio-label">🍗 Non-Vegetarian</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="both"
                name="dietType"
                value="both"
                checked={formData.dietType === 'both'}
                onChange={handleChange}
                className="form-radio"
              />
              <label htmlFor="both" className="radio-label">🍽️ Both</label>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="form-group">
          <label htmlFor="familyMembers">
            Family Members
            <span className="form-value">{formData.familyMembers}</span>
          </label>
          <input
            type="range"
            id="familyMembers"
            name="familyMembers"
            min="1"
            max="20"
            value={formData.familyMembers}
            onChange={handleChange}
            className="form-range"
          />
          <div className="input-number">
            <input
              type="number"
              name="familyMembers"
              min="1"
              max="20"
              value={formData.familyMembers}
              onChange={handleChange}
              className={errors.familyMembers ? 'input-error' : ''}
            />
          </div>
          {errors.familyMembers && <span className="error-message">{errors.familyMembers}</span>}
        </div>

        {/* Days Left for New Cylinder */}
        <div className="form-group">
          <label htmlFor="daysLeftForNewCylinder">
            Days Left for New Cylinder Delivery
          </label>
          <input
            type="number"
            id="daysLeftForNewCylinder"
            name="daysLeftForNewCylinder"
            min="0"
            max="90"
            value={formData.daysLeftForNewCylinder}
            onChange={handleChange}
            className={errors.daysLeftForNewCylinder ? 'form-input input-error' : 'form-input'}
            placeholder="e.g., 7"
          />
          {errors.daysLeftForNewCylinder && <span className="error-message">{errors.daysLeftForNewCylinder}</span>}
        </div>

        {/* Ingredients */}
        <div className="form-group">
          <label htmlFor="ingredients">
            Ingredients You Have
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className={errors.ingredients ? 'form-textarea input-error' : 'form-textarea'}
            placeholder="Enter ingredients separated by commas (e.g., dal, rice, onion, tomato, potato)"
            rows="4"
          />
          {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
        </div>

        {/* Weekly Plan Checkbox */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="weeklyPlan"
            name="weeklyPlan"
            checked={formData.weeklyPlan}
            onChange={handleChange}
            className="form-checkbox"
          />
          <label htmlFor="weeklyPlan" className="checkbox-label">
            📅 Generate a 7-day meal plan
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Get Recommendations 🔄
        </button>
      </form>
    </div>
  )
}

export default RecommendationForm
