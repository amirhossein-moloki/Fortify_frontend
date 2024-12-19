'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Camera, AtSign, Mail, User, MapPin, Globe, Pencil, Calendar, Cake } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUserProfile, updateUserProfile, UserProfile } from '@/utils/api'
import { cn } from '@/lib/utils'
import ProfilePictureModal from './ProfilePictureModal'
import UpdateProfileForm from './UpdateProfileForm'
import InlineEdit from './InlineEdit'

const defaultProfile: UserProfile = {
  user: {
    username: 'Unknown User',
    email: 'No email provided',
    is_online: false,
    last_seen: new Date().toISOString(),
    profile_picture: '/placeholder.svg?height=200&width=200',
    bio: 'No bio available',
    is_owner: false,
  },
  profile: {
    date_of_birth: '',
    gender: '',
    location: '',
    website: '',
  },
}

export default function ProfilePage({
  params
}: {
  params: { username: string }
}) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('fortify_access')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const data = await getUserProfile(params.username, token)
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params.username, router])

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const updatedProfile = await updateUserProfile(updatedData, token)
      setProfile(updatedProfile)
      setIsUpdateFormOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      // Handle error (e.g., show error message to user)
    }
  }

  const handleInlineEdit = async (field: string, value: string) => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const updatedData = { ...profile }
      if (field in updatedData.user) {
        (updatedData.user as any)[field] = value
      } else if (field in updatedData.profile) {
        (updatedData.profile as any)[field] = value
      }

      const updatedProfile = await updateUserProfile(updatedData, token)
      setProfile(updatedProfile)
      setEditingField(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      // Handle error (e.g., show error message to user)
    }
  }

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

  const userData = profile.user
  const profileData = profile.profile || {}

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
          {userData.is_owner && (
            <button
              onClick={() => setIsUpdateFormOpen(true)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Pencil className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={`http://localhost:8000${userData.profile_picture?.startsWith('/') ? '' : '/'}${userData.profile_picture}`}
              alt={userData.username}
              className="w-24 h-24 rounded-full object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
            {userData.is_owner && (
              <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold">{userData.username}</h2>
            <p className="text-gray-400">{userData.is_online ? 'online' : 'offline'}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-[#2D2A3D] rounded-lg p-4 mb-4">
          {editingField === 'bio' ? (
            <InlineEdit
              value={userData.bio || ''}
              onSave={(value) => handleInlineEdit('bio', value)}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">
                {userData.bio || 'No bio added yet'}
              </p>
              {userData.is_owner && (
                <button
                  onClick={() => setEditingField('bio')}
                  className="text-purple-500 hover:text-purple-400"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="bg-[#2D2A3D] rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-800">
            <ProfileField
              icon={User}
              label="Username"
              value={userData.username}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('username')}
              isEditing={editingField === 'username'}
              onSave={(value) => handleInlineEdit('username', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={userData.email}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('email')}
              isEditing={editingField === 'email'}
              onSave={(value) => handleInlineEdit('email', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={AtSign}
              label="Username"
              value={`@${userData.username}`}
            />
            <ProfileField
              icon={Calendar}
              label="Last Seen"
              value={new Date(userData.last_seen).toLocaleString()}
            />
            <ProfileField
              icon={Cake}
              label="Date of Birth"
              value={profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'Not provided'}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('date_of_birth')}
              isEditing={editingField === 'date_of_birth'}
              onSave={(value) => handleInlineEdit('date_of_birth', value)}
              onCancel={() => setEditingField(null)}
              inputType="date"
            />
            <ProfileField
              icon={User}
              label="Gender"
              value={profileData.gender || 'Not specified'}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('gender')}
              isEditing={editingField === 'gender'}
              onSave={(value) => handleInlineEdit('gender', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={MapPin}
              label="Location"
              value={profileData.location || 'Not specified'}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('location')}
              isEditing={editingField === 'location'}
              onSave={(value) => handleInlineEdit('location', value)}
              onCancel={() => setEditingField(null)}
            />
            <ProfileField
              icon={Globe}
              label="Website"
              value={profileData.website || 'Not specified'}
              isEditable={userData.is_owner}
              onEdit={() => setEditingField('website')}
              isEditing={editingField === 'website'}
              onSave={(value) => handleInlineEdit('website', value)}
              onCancel={() => setEditingField(null)}
              inputType="url"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProfilePictureModal
          imageUrl={`http://localhost:8000${userData.profile_picture?.startsWith('/') ? '' : '/'}${userData.profile_picture}`}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isUpdateFormOpen && (
        <UpdateProfileForm
          profile={profile}
          onUpdate={handleUpdateProfile}
          onClose={() => setIsUpdateFormOpen(false)}
        />
      )}
    </div>
  )
}

interface ProfileFieldProps {
  icon: React.ElementType
  label: string
  value: string
  isEditable?: boolean
  onEdit?: () => void
  isEditing?: boolean
  onSave?: (value: string) => void
  onCancel?: () => void
  inputType?: string
}

function ProfileField({
  icon: Icon,
  label,
  value,
  isEditable = false,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
  inputType = 'text'
}: ProfileFieldProps) {
  return (
    <div className="flex items-start p-4">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-gray-400 text-sm">{label}</p>
          {isEditing ? (
            <InlineEdit
              value={value}
              onSave={onSave!}
              onCancel={onCancel!}
              inputType={inputType}
            />
          ) : (
            <div className="flex items-center">
              <span className="text-sm text-white mr-2">{value}</span>
              {isEditable && (
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

