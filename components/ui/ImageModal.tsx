import React from 'react'
import { X } from 'lucide-react'

interface ImageModalProps {
  imageUrl: string
  onClose: () => void
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={imageUrl} alt="Enlarged" className="max-w-full max-h-[90vh] object-contain" />
      </div>
    </div>
  )
}

