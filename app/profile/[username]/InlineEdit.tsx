import React, { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  inputType?: string
  options?: string[]
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, onCancel, inputType = 'text', options = [] }) => {
  const [editedValue, setEditedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSave = () => {
    onSave(editedValue)
  }

  const renderInput = () => {
    switch (inputType) {
      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded mr-2"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded mr-2 w-full"
            rows={3}
          />
        )
      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded mr-2"
          />
        )
    }
  }

  return (
    <div className="flex items-center">
      {renderInput()}
      <button onClick={handleSave} className="text-green-500 hover:text-green-400 mr-2">
        <Check size={16} />
      </button>
      <button onClick={onCancel} className="text-red-500 hover:text-red-400">
        <X size={16} />
      </button>
    </div>
  )
}

export default InlineEdit

