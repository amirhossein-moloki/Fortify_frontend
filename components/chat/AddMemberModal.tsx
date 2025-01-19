import React, { useState } from 'react'
import axios from 'axios'
import { X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddMemberModalProps {
  chatId: number
  onClose: () => void
  onSuccess: () => void
}

export function AddMemberModal({ chatId, onClose, onSuccess }: AddMemberModalProps) {
  const [usernames, setUsernames] = useState<string[]>([''])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddUser = () => {
    setUsernames([...usernames, ''])
  }

  const handleRemoveUser = (index: number) => {
    const newUsernames = usernames.filter((_, i) => i !== index)
    setUsernames(newUsernames)
  }

  const handleUsernameChange = (index: number, value: string) => {
    const newUsernames = [...usernames]
    newUsernames[index] = value
    setUsernames(newUsernames)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const filteredUsernames = usernames.filter(username => username.trim() !== '')

    if (filteredUsernames.length === 0) {
      setError('Please enter at least one username.')
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('fortify_access')
      const response = await axios.post(
        `${process.env.BASE_URL}api/chats/chat/${chatId}/add-users/`,
        { usernames: filteredUsernames },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || 'An error occurred while adding members.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2A3D] p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {usernames.map((username, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(index, e.target.value)}
                placeholder="Enter username"
                className="flex-1 bg-[#1F1D2B] text-white"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUser(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={handleAddUser}
            className="w-full bg-[#1F1D2B] text-white hover:bg-[#2D2A3D]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Another User
          </Button>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding Members...' : 'Add Members'}
          </Button>
        </form>
      </div>
    </div>
  )
}

