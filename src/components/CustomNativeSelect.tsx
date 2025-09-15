'use client'

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface CustomNativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[]
  value?: string
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  error?: string
  label?: string
  className?: string
  containerClassName?: string
}

export const CustomNativeSelect = forwardRef<HTMLSelectElement, CustomNativeSelectProps>(
  ({ 
    options, 
    value, 
    onChange, 
    placeholder,
    error,
    label,
    className = '',
    containerClassName = '',
    disabled = false,
    required = false,
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event.target.value, event)
    }

    const baseSelectClasses = `
      /* Reset native appearance */
      appearance-none
      -webkit-appearance-none
      -moz-appearance-none
      
      /* Base styling */
      w-full
      px-4
      py-3
      pr-12
      bg-white
      border
      rounded-lg
      text-sm
      font-medium
      
      /* Focus states */
      focus:outline-none
      focus:ring-2
      focus:ring-amber-500
      focus:border-amber-500
      
      /* Hover states */
      hover:border-amber-400
      
      /* Disabled states */
      disabled:bg-gray-100
      disabled:text-gray-400
      disabled:cursor-not-allowed
      disabled:border-gray-300
      
      /* Transitions */
      transition-all
      duration-200
      
      /* Text styling */
      text-gray-900
      
      /* Ensure sufficient contrast */
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      ${!value && placeholder ? 'text-gray-500' : ''}
    `

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            value={value || ''}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={`${baseSelectClasses} ${className}`.trim()}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
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
          
          {/* Custom Arrow */}
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
            disabled ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

CustomNativeSelect.displayName = 'CustomNativeSelect'
