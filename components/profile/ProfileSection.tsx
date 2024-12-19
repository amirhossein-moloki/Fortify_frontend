import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { UserProfile } from '@/utils/api'
import { useRouter } from 'next/navigation'

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  onNightModeToggle: () => void;
  nightMode: boolean;
  onProfileClick: (username: string) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
  onNightModeToggle,
  nightMode,
  onProfileClick
}) => {
  const router = useRouter()
  
  if (!userProfile) {
    return <div className="text-white">Loading profile...</div>;
  }

  const userData = userProfile.user;
  if (!userData) {
    return <div className="text-white">No user data available</div>;
  }

  return (
    <div className="p-4">
      <div 
        className="flex items-center space-x-3 mb-6 cursor-pointer" 
        onClick={() => onProfileClick(userData.username)}
      >
        <img
          src={`http://localhost:8000${userData.profile_picture?.startsWith('/') ? '' : '/'}${userData.profile_picture}`}
          alt={userData.username}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg?height=64&width=64';
          }}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg">{userData.username}</h3>
          <p className="text-gray-400 text-sm">{userData.is_online ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      
      <div className="text-gray-400 text-sm mb-4">
        {userData.bio && (
          <p className="mb-2">
            <span className="font-medium">Bio:</span> {userData.bio}
          </p>
        )}
        <p className="mb-2">
          <span className="font-medium">Last seen:</span> {new Date(userData.last_seen).toLocaleString()}
        </p>
      </div>
      
      <div className="mt-6">
        <button
          onClick={onNightModeToggle}
          className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-400 hover:bg-purple-500/10 hover:text-purple-500"
        >
          {nightMode ? (
            <>
              <Sun className="w-5 h-5" />
              <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span>Night Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

