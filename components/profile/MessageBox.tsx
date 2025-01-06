import React from 'react'
import { X } from 'lucide-react'

interface MessageBoxProps {
  message: string
  type: 'error' | 'success'
  onClose: () => void
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg max-w-md`}>
      <div className="flex justify-between items-start">
        <p className="mr-4">{message}</p>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

export default MessageBox

