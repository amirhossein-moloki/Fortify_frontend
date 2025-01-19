'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Bell, Users, UserPlus, UserMinus, Trash2, Edit, Camera } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChatDetails, getChatParticipants, removeUsersFromChat, updateChat } from '@/utils/api'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { DeleteChatModal } from './DeleteChatModal';

interface ChatInfoProps {
  chatId: number;
  onClose: () => void;
}

export function ChatInfo({ chatId, onClose }: ChatInfoProps) {
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberUsername, setNewMemberUsername] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newChatName, setNewChatName] = useState(chatDetails?.group_name || '')
  const [newDescription, setNewDescription] = useState(chatDetails?.description || '')
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchChatDetails()
  }, [chatId])

  useEffect(() => {
    if (chatDetails) {
      const currentUser = chatDetails.participants.find(p => p.username === localStorage.getItem('fortify_username'))
      setIsAdmin(chatDetails.group_admin.some(admin => admin.id === currentUser?.id))
      setNewChatName(chatDetails.group_name)
      setNewDescription(chatDetails.description)
    }
  }, [chatDetails])

  const fetchChatDetails = async () => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')
      
      const data = await getChatParticipants(chatId, token)
      setChatDetails(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load chat details')
      setLoading(false)
    }
  }

  const handleUserSelect = (username: string) => {
    setSelectedUsers(prev => 
      prev.includes(username) 
        ? prev.filter(name => name !== username)
        : [...prev, username]
    )
  }

  const handleRemoveUsers = async () => {
    if (!selectedUsers.length) return

    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const result = await removeUsersFromChat(chatId, selectedUsers, token)
      if (result.success) {
        await fetchChatDetails()
        setSelectedUsers([])
        // You might want to show a success message here
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to remove users')
      }
    }
  }

  const handleAddMember = async () => {
    if (!newMemberUsername.trim()) return

    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const response = await axios.post(
        `${process.env.BASE_URL}api/chats/chat/${chatId}/add-users/`,
        { usernames: [newMemberUsername] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 200) {
        await fetchChatDetails()
        setNewMemberUsername('')
        setShowAddMemberModal(false)
        // You might want to show a success message here
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'An error occurred while adding the member.')
      } else {
        setError('An unexpected error occurred while adding the member.')
      }
    }
  }

  const handleDeleteChat = () => {
    setShowDeleteModal(true);
  };

  const handleUpdateChat = async (updatedData: Partial<ChatDetails>) => {
    try {
      const token = localStorage.getItem('fortify_access')
      if (!token) throw new Error('No authentication token found')

      const formData = new FormData()
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'string' || value instanceof Blob) {
            formData.append(key, value)
          } else if (typeof value === 'number') {
            formData.append(key, value.toString())
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, JSON.stringify(item))
            })
          } else {
            formData.append(key, JSON.stringify(value))
          }
        }
      })

      const updatedChatDetails = await updateChat(chatId, formData, token)
      setChatDetails(updatedChatDetails)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update chat details')
      }
    }
  }

  const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('group_image', file)

      try {
        const token = localStorage.getItem('fortify_access')
        if (!token) throw new Error('No authentication token found')

        const updatedChatDetails = await updateChat(chatId, formData, token)
        setChatDetails(updatedChatDetails)
      } catch (error) {
        console.error('Error updating chat image:', error)
        setError('Failed to update chat image')
      }
    }
  }

  const handleUpdateChatInfo = async () => {
    if (newChatName !== chatDetails?.group_name || newDescription !== chatDetails?.description) {
      try {
        const token = localStorage.getItem('fortify_access')
        if (!token) throw new Error('No authentication token found')

        const formData = new FormData()
        formData.append('group_name', newChatName)
        formData.append('description', newDescription)

        const updatedChatDetails = await updateChat(chatId, formData, token)
        setChatDetails(updatedChatDetails)
        setIsEditing(false)
      } catch (error) {
        console.error('Error updating chat info:', error)
        setError('Failed to update chat info')
      }
    } else {
      setIsEditing(false)
    }
  }

  if (loading) {
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="text-white text-xl">Loading chat details...</div>
    </div>
  }

  if (error || !chatDetails) {
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="text-red-500 text-xl">{error || 'Failed to load chat details'}</div>
    </div>
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-10">
      <div className="bg-[#1F1D2B] rounded-lg w-full max-w-md mb-10">
        {/* Header */}
        <div className="p-4 flex items-start justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={`${process.env.BASE_URL_MD}${chatDetails.group_image}`} 
                alt={chatDetails.group_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpdate}
                accept="image/*"
              />
            </div>
            <div>
              {isEditing ? (
                <Input
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="mb-2"
                />
              ) : (
                <h2 className="text-lg font-semibold text-white">{chatDetails.group_name}</h2>
              )}
              <p className="text-sm text-gray-400">{chatDetails.participants.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white">
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border-b border-gray-700">
          {isEditing ? (
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full"
              placeholder="Group description"
            />
          ) : (
            <p className="text-white">{chatDetails.description}</p>
          )}
        </div>

        {/* Notifications */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-white">Notifications</span>
            </div>
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>
        </div>

        {/* Members */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">
                {chatDetails.participants.length} MEMBERS
              </span>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMemberModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Members
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {chatDetails.participants.map(participant => (
              <div 
                key={participant.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-700/30 rounded-lg"
              >
                {isAdmin && !chatDetails.group_admin.some(admin => admin.id === participant.id) && (
                  <Checkbox
                    checked={selectedUsers.includes(participant.username)}
                    onCheckedChange={() => handleUserSelect(participant.username)}
                  />
                )}
                <img
                  src={`${process.env.BASE_URL_MD}${participant.profile_picture}`}
                  alt={participant.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{participant.username}</span>
                    {chatDetails.group_admin.some(admin => admin.id === participant.id) && (
                      <span className="text-xs text-blue-400">admin</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {participant.is_online ? 'online' : `last seen ${new Date(participant.last_seen).toLocaleString()}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdmin && selectedUsers.length > 0 && (
            <div className="mt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveUsers}
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove Selected Members ({selectedUsers.length})
              </Button>
            </div>
          )}
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Add New Member</h3>
            <div className="flex space-x-2">
              <Input
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-grow"
              />
              <Button onClick={handleAddMember}>Add</Button>
            </div>
          </div>
        )}

        {/* Delete Chat Button */}
        {isAdmin && (
          <div className="p-4 border-t border-gray-700">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteChat}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Chat
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="p-4 border-t border-gray-700">
            <Button onClick={handleUpdateChatInfo} className="w-full">
              Save Changes
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg mb-4">
            {error}
          </div>
        )}
        {showDeleteModal && (
            <DeleteChatModal
            chatId={chatId}
            onClose={() => setShowDeleteModal(false)}
            onDelete={async () => {
              try {
                const token = localStorage.getItem('fortify_access');
                if (!token) throw new Error('No authentication token found');
        
                const apiUrl = `${process.env.BASE_URL}api/chats/chat/${chatId}/delete/`;
                console.log('API URL:', apiUrl); // چاپ URL درخواست
        
                await axios.delete(apiUrl, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                
                // بسته شدن Modal
                onClose(); // Close the ChatInfo component
                
                // رفرش صفحه
                window.location.reload(); // رفرش صفحه بعد از حذف چت
              } catch (error) {
                console.error('Error deleting chat:', error);
                setError('Failed to delete the chat. Please try again.');
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

