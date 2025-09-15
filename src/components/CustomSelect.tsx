'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
  icon?: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  error
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchQuery('')
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left border rounded-lg transition-all duration-200 ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-gray-300'
            : error
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
            : isOpen
            ? 'border-amber-500 ring-2 ring-amber-500 ring-opacity-20'
            : 'border-gray-300 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
        } ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}
        whileHover={!disabled ? { scale: 1.005 } : {}}
        whileTap={!disabled ? { scale: 0.995 } : {}}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="text-lg flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 ml-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Input (for large lists) */}
            {options.length > 5 && (
              <div className="p-3 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto py-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-sm text-left transition-all duration-200 group ${
                      option.value === value
                        ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500'
                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {option.icon && (
                        <span className="text-lg flex-shrink-0">{option.icon}</span>
                      )}
                      <span className="truncate font-medium">{option.label}</span>
                    </div>
                    
                    {option.value === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 ml-2"
                      >
                        <Check className="w-4 h-4 text-amber-600" />
                      </motion.div>
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="px-6 py-4 text-sm text-gray-500 text-center">
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



