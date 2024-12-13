'use client'

import { useState, useRef } from 'react'
import { Edit, Trash2, Copy } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface MessageProps {
  id: number
  content: string
  sender: string
  sender_profile_picture: string
  timestamp: string
  isOwn: boolean
  onEdit: (newContent: string) => void
  onDelete: () => void
}

export function MessageBubble({
  id,
  content,
  sender,
  sender_profile_picture,
  timestamp,
  isOwn,
  onEdit,
  onDelete
}: MessageProps) {
  const [isLongPress, setIsLongPress] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  const handleEdit = () => {
    onEdit(content)
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isOwn && (
        <img
          src={sender_profile_picture}
          alt={sender}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <DropdownMenu
        open={isLongPress}
        onOpenChange={setIsLongPress}
        trigger={
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              isOwn
                ? 'bg-blue-600 text-white ml-auto'
                : 'bg-gray-700 text-white'
            }`}
          >
            {!isOwn && (
              <div className="text-sm font-medium mb-1">{sender}</div>
            )}
            <div className="break-words">{content}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        }
      >
        {isOwn && (
          <>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              ویرایش
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          کپی
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
}

