import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { UserProfile } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface ProfileSectionProps {
  userProfile: UserProfile;
  onNightModeToggle: () => void;
  nightMode: boolean;
  onProfileClick: (username: string) => void;
}

const getFullUrl = (path: string): string => {
  const baseUrl = process.env.BASE_URL_MD || 'http://localhost:8000';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
  onNightModeToggle,
  nightMode,
  onProfileClick,
}) => {
  const router = useRouter();

  if (!userProfile) {
    return <div className="text-white">Loading profile...</div>;
  }

  const userData = userProfile.profile.user;
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
          src={getFullUrl(userData.profile_picture || '/placeholder.svg')}
          alt={userData.username}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg">{userData.username}</h3>
          <p className="text-gray-400 text-sm">{userData.email}</p>
        </div>
      </div>

      <div className="text-gray-400 text-sm mb-4">
        <p className="mb-2">
          <span className="font-medium">Status:</span> {userData.is_online ? 'Online' : 'Offline'}
        </p>
        <p className="mb-2">
          <span className="font-medium">Last seen:</span> {formatDateTime(userData.last_seen)}
        </p>
        {userData.bio && (
          <p className="mb-2">
            <span className="font-medium">Bio:</span> {userData.bio}
          </p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onNightModeToggle}
          aria-label={nightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
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
  );
};
