'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Image, Check, Users, Calendar, Clock, X } from 'lucide-react'

export default function CreateChatPage() {
  const router = useRouter()
  const [chatType, setChatType] = useState<string>('direct')
  const [user2, setUser2] = useState<string>('')
  const [groupName, setGroupName] = useState<string>('')
  const [maxParticipants, setMaxParticipants] = useState<number>(50)
  const [groupImage, setGroupImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [serverResponse, setServerResponse] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setServerResponse(null)

    const token = localStorage.getItem('fortify_access')
    if (!token) {
      setError('You must be logged in to create a chat.')
      return
    }

    if (chatType === 'group' && maxParticipants < 2) {
      setError('Group chats require at least 2 participants.')
      return
    }

    if ((chatType === 'group' || chatType === 'channel') && !groupName) {
      setError(`${chatType === 'group' ? 'Group' : 'Channel'} name is required.`)
      return
    }

    if ((chatType === 'group' || chatType === 'channel') && !groupImage) {
      setError(`${chatType === 'group' ? 'Group' : 'Channel'} image is required.`)
      return
    }

    const formData = new FormData()
    formData.append('chat_type', chatType)
    formData.append('user2', user2)
    if (chatType === 'group' || chatType === 'channel') {
      formData.append('group_name', groupName)
      if (groupImage) {
        formData.append('group_image', groupImage)
      }
    }
    if (chatType === 'group') {
      formData.append('max_participants', maxParticipants.toString())
    }

    try {
      const response = await axios.post(
        `${process.env.BASE_URL}api/chats/chat/create/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.status === 201) {
        setSuccess(true)
        setServerResponse(response.data)
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || 'An error occurred while creating the chat.')
      } else {
        setError('An unexpected error occurred.')
      }
    }
  }

  const handleReset = () => {
    setChatType('direct')
    setUser2('')
    setGroupName('')
    setMaxParticipants(50)
    setGroupImage(null)
    setError(null)
    setSuccess(false)
    setServerResponse(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGroupImage(e.target.files[0])
    }
  }

  const handleCancel = () => {
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-[#1F1D2B] flex items-center justify-center relative">
      <Button
        onClick={handleCancel}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <div className="bg-[#2D2A3D] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Chat</h1>
        {success && serverResponse && (
          <div className="bg-green-500 text-white p-6 rounded-md mb-6">
            <div className="flex items-center justify-center mb-4">
              <Check className="w-12 h-12 text-white bg-green-600 rounded-full p-2" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Successful!</h2>
            <div className="space-y-4">
              <div className="bg-green-600 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Chat Details</h3>
                <p><strong>Name:</strong> {serverResponse.group_name || 'Direct Chat'}</p>
                <p><strong>Type:</strong> {serverResponse.chat_type}</p>
                <p><strong>ID:</strong> {serverResponse.id}</p>
              </div>
              <div className="bg-green-600 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Participants</h3>
                <ul className="list-disc list-inside">
                  {serverResponse.participants.map((participant: any) => (
                    <li key={participant.id}>{participant.username}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-600 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Admin</h3>
                <p>{serverResponse.group_admin?.username}</p>
              </div>
              <div className="bg-green-600 p-4 rounded-md flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <p>Created: {new Date(serverResponse.created_at).toLocaleString()}</p>
              </div>
              {serverResponse.chat_type !== 'direct' && (
                <div className="bg-green-600 p-4 rounded-md flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <p>Max Participants: {serverResponse.max_participants}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex space-x-4">
              <Button onClick={() => router.push('/chat')} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Go to Chats
              </Button>
              <Button onClick={handleReset} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Create Another
              </Button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="chat-type" className="text-white">Chat Type</Label>
            <Select onValueChange={(value) => setChatType(value)} defaultValue={chatType}>
              <SelectTrigger className="w-full bg-[#1F1D2B] text-white">
                <SelectValue placeholder="Select chat type" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="channel">Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="user2" className="text-white">User 2 Username</Label>
            <Input
              id="user2"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              className="w-full bg-[#1F1D2B] text-white"
              placeholder="Enter username"
            />
          </div>

          {(chatType === 'group' || chatType === 'channel') && (
            <>
              <div>
                <Label htmlFor="group-name" className="text-white">{chatType === 'group' ? 'Group' : 'Channel'} Name</Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#1F1D2B] text-white"
                  placeholder={`Enter ${chatType === 'group' ? 'group' : 'channel'} name`}
                />
              </div>
              <div>
                <Label htmlFor="group-image" className="text-white">{chatType === 'group' ? 'Group' : 'Channel'} Image</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1F1D2B] text-white hover:bg-[#2D2A3D]"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  {groupImage && (
                    <span className="text-white">{groupImage.name}</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="group-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </>
          )}

          {chatType === 'group' && (
            <div>
              <Label htmlFor="max-participants" className="text-white">Max Participants</Label>
              <Input
                id="max-participants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Math.max(2, parseInt(e.target.value) || 2))}
                className="w-full bg-[#1F1D2B] text-white"
                placeholder="Enter max participants"
                min={2}
              />
              <p className="text-sm text-gray-400 mt-1">Minimum 2 participants required</p>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            Create Chat
          </Button>
        </form>
      </div>
    </div>
  )
}

