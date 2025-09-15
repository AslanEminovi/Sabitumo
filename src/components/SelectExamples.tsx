'use client'

import { useState } from 'react'
import { CustomNativeSelect } from './CustomNativeSelect'

/**
 * Examples of custom select implementations
 * This file demonstrates both React component and CSS class approaches
 */

export function SelectExamples() {
  const [reactValue, setReactValue] = useState('')
  const [cssValue, setCssValue] = useState('')

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4 (Disabled)', disabled: true },
  ]

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Select Examples</h2>
      
      {/* React Component Approach */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">React Component (Recommended)</h3>
        
        {/* Basic Usage */}
        <CustomNativeSelect
          label="Basic Select"
          options={options}
          value={reactValue}
          onChange={(value) => setReactValue(value)}
          placeholder="Choose an option..."
          className="mb-4"
        />

        {/* With Error State */}
        <CustomNativeSelect
          label="Select with Error"
          options={options}
          value=""
          onChange={() => {}}
          placeholder="This has an error..."
          error="This field is required"
          className="mb-4"
        />

        {/* Disabled State */}
        <CustomNativeSelect
          label="Disabled Select"
          options={options}
          value="option1"
          onChange={() => {}}
          disabled
          className="mb-4"
        />
      </div>

      {/* CSS Class Approach */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">CSS Class Approach</h3>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plain CSS Implementation
        </label>
        
        <div className="custom-select">
          <select 
            value={cssValue} 
            onChange={(e) => setCssValue(e.target.value)}
            className="w-full"
          >
            <option value="">Select an option...</option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <svg className="arrow" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Usage Examples:</h4>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>React Component:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<CustomNativeSelect
  label="Currency"
  options={[
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' }
  ]}
  value={currency}
  onChange={setCurrency}
  placeholder="Select currency..."
  error={errors.currency}
/>`}
          </pre>
          
          <p><strong>CSS Class:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<div className="custom-select">
  <select>
    <option value="">Choose...</option>
    <option value="1">Option 1</option>
  </select>
  <svg className="arrow">...</svg>
</div>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default SelectExamples



