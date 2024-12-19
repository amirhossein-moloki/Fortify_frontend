import React, { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  inputType?: string
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, onCancel, inputType = 'text' }) => {
  const [editedValue, setEditedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = () => {
    onSave(editedValue)
  }

  return (
    <div className="flex items-center">
      <input
        ref={inputRef}
        type={inputType}
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        className="bg-gray-700 text-white px-2 py-1 rounded mr-2"
      />
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

