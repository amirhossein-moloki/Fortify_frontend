'use client'
import { Analytics } from "@vercel/analytics/react"
import { useEffect, useState } from 'react'
import { ArrowLeft, Camera, Mail, User, MapPin, Globe, Pencil, Calendar, Cake, UserCircle, FileText, Check, X } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { getUserProfile, updateUserProfile, UserProfile, PartialUserProfile } from '@/utils/api'
import { cn } from '@/lib/utils'
import ProfilePictureModal from './ProfilePictureModal'
import InlineEdit from './InlineEdit'
import MessageBox from '@/components/profile/MessageBox'

const defaultProfile: UserProfile = {
  is_owner: false,
  profile: {
    id: 0,
    user: {
      id: 0,
      username: 'Unknown User',
      email: 'No email provided',
      is_online: false,
      last_seen: new Date().toISOString(),
      profile_picture: '/placeholder.svg?height=200&width=200',
      bio: 'No bio available',
    },
    date_of_birth: '',
    gender: '',
    location: '',
    website: '',
  },
};

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<PartialUserProfile>({})
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [pendingProfilePicture, setPendingProfilePicture] = useState<File | null>(null);
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('fortify_access')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const data = await getUserProfile(username, token)
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username, router])

  const handleFieldChange = (field: string, value: string) => {
    setPendingChanges(prev => {
      const newChanges: PartialUserProfile = { ...prev };
      if (field in (profile.profile.user || {})) {
        newChanges.user = { ...newChanges.user, [field]: value || undefined };
      } else if (field in (profile.profile || {})) {
        (newChanges as any)[field] = value || undefined;
      }
      return newChanges;
    });
    setEditingField(null);
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')
  
      const updatedData = { ...pendingChanges };
      if (pendingProfilePicture) {
        updatedData.profile_picture = pendingProfilePicture;
      }
  
      console.log('Updating profile with:', updatedData);
      const updatedProfile = await updateUserProfile(updatedData, token)
      console.log('Updated profile:', updatedProfile);
  
      if (pendingChanges.user?.username) {
        localStorage.setItem('fortify_username', pendingChanges.user.username);
      }
  
      setProfile(updatedProfile)
      setPendingChanges({})
      setPendingProfilePicture(null)
      setMessage({ text: 'Profile updated successfully', type: 'success' })
  
      router.push(`/profile/${updatedProfile.profile.user.username}`);
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' })
    }
  }

  const handleProfilePictureUpdate = async (file: File) => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const formData = new FormData()
      formData.append('profile_picture', file)

      const updatedProfile = await updateUserProfile({ profile_picture: file }, token)
      setProfile(updatedProfile)
      setMessage({ text: 'Profile picture updated successfully', type: 'success' })
    } catch (error) {
      console.error('Error updating profile picture:', error)
      setMessage({ text: 'Failed to update profile picture. Please try again.', type: 'error' })
    }
  }

  const handleCancelChanges = () => {
    setPendingChanges({});
    setPendingProfilePicture(null);
    setEditingField(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1F1D2B] text-white">
        Loading profile...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1F1D2B] text-white">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1F1D2B] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#2D2A3D] border-b border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-bold">Profile Info</h1>
          </div>
          {(Object.keys(pendingChanges).length > 0 || pendingProfilePicture) && (
            <div>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-2"
              >
                <Check className="w-5 h-5 mr-2 inline-block" />
                Save Changes
              </button>
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <X className="w-5 h-5 mr-2 inline-block" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={pendingProfilePicture ? URL.createObjectURL(pendingProfilePicture) : `${process.env.BASE_URL_MD}${profile.profile.user.profile_picture?.startsWith('/') ? '' : '/'}${profile.profile.user.profile_picture}`}
              alt={profile.profile.user.username}
              className="w-24 h-24 rounded-full object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
            {profile.is_owner && (
              <label htmlFor="profile-picture-input" className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 cursor-pointer">
                <Camera className="w-4 h-4" />
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPendingProfilePicture(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold">{pendingChanges.user?.username || profile.profile.user.username}</h2>
            <p className="text-gray-400">{profile.profile.user.is_online ? 'online' : 'offline'}</p>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-[#2D2A3D] rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold flex items-center">
              <UserCircle className="w-5 h-5 mr-2" />
              User Information
            </h3>
          </div>
          <div className="divide-y divide-gray-800">
            <ProfileField
              icon={User}
              label="Username"
              value={pendingChanges.user?.username || profile.profile.user.username}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('username')}
              isEditing={editingField === 'username'}
              onSave={(value) => handleFieldChange('username', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={pendingChanges.user?.email || profile.profile.user.email}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('email')}
              isEditing={editingField === 'email'}
              onSave={(value) => handleFieldChange('email', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={FileText}
              label="Bio"
              value={pendingChanges.user?.bio || profile.profile.user.bio || 'No bio added yet'}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('bio')}
              isEditing={editingField === 'bio'}
              onSave={(value) => handleFieldChange('bio', value)}
              onCancel={() => setEditingField(null)}
              inputType="textarea"
            />
            <ProfileField
              icon={Calendar}
              label="Last Seen"
              value={new Date(profile.profile.user.last_seen).toLocaleString()}
              isEditable={false}
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-[#2D2A3D] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h3>
          </div>
          <div className="divide-y divide-gray-800">
            <ProfileField
              icon={Cake}
              label="Date of Birth"
              value={pendingChanges.date_of_birth || (profile.profile.date_of_birth ? new Date(profile.profile.date_of_birth).toLocaleDateString() : 'Not provided')}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('date_of_birth')}
              isEditing={editingField === 'date_of_birth'}
              onSave={(value) => handleFieldChange('date_of_birth', value)}
              onCancel={() => setEditingField(null)}
              inputType="date"
            />
            <ProfileField
              icon={User}
              label="Gender"
              value={pendingChanges.gender || profile.profile.gender || 'Not specified'}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('gender')}
              isEditing={editingField === 'gender'}
              onSave={(value) => handleFieldChange('gender', value)}
              onCancel={() => setEditingField(null)}
              inputType="select"
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
            />
            <ProfileField
              icon={MapPin}
              label="Location"
              value={pendingChanges.location || profile.profile.location || 'Not specified'}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('location')}
              isEditing={editingField === 'location'}
              onSave={(value) => handleFieldChange('location', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={Globe}
              label="Website"
              value={pendingChanges.website || profile.profile.website || 'Not specified'}
              isEditable={profile.is_owner}
              onEdit={() => setEditingField('website')}
              isEditing={editingField === 'website'}
              onSave={(value) => handleFieldChange('website', value)}
              onCancel={() => setEditingField(null)}
              inputType="url"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProfilePictureModal
          imageUrl={pendingProfilePicture ? URL.createObjectURL(pendingProfilePicture) : `${process.env.BASE_URL_MD}${profile.profile.user.profile_picture?.startsWith('/') ? '' : '/'}${profile.profile.user.profile_picture}`}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleProfilePictureUpdate}
        />
      )}

      {message && (
        <MessageBox
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  )
}

interface ProfileFieldProps {
  icon: React.ElementType
  label: string
  value: string
  isEditable: boolean
  onEdit?: () => void
  isEditing?: boolean
  onSave?: (value: string) => void
  onCancel?: () => void
  inputType?: string
  options?: string[]
}

function ProfileField({
  icon: Icon,
  label,
  value,
  isEditable,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
  inputType = 'text',
  options = []
}: ProfileFieldProps) {
  const [pendingValue, setPendingValue] = useState(value);

  return (
    <div className="flex items-start p-4">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-gray-400 text-sm">{label}</p>
          {isEditing ? (
            <InlineEdit
              value={pendingValue}
              onSave={(newValue) => {
                setPendingValue(newValue);
                onSave!(newValue);
              }}
              onCancel={() => {
                setPendingValue(value);
                onCancel!();
              }}
              inputType={inputType}
              options={options}
            />
          ) : (
            <div className="flex items-center">
              <span className="text-sm text-white mr-2">
                {pendingValue !== value ? (
                  <>
                    <span className="line-through text-gray-500">{value}</span>{' '}
                    <span className="text-purple-400">{pendingValue}</span>
                  </>
                ) : (
                  value
                )}
              </span>
              {isEditable && !isEditing && (
                <button
                  onClick={onEdit}
                  className="text-purple-500 hover:text-purple-400"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

