import React from 'react'
import { X } from 'lucide-react'

interface ProfilePictureModalProps {
  imageUrl: string
  onClose: () => void
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2D2A3D] p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <img src={imageUrl} alt="Profile" className="w-full h-auto rounded-lg" />
      </div>
    </div>
  )
}

export default ProfilePictureModal

