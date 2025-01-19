'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit, Trash2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface MessageProps {
  id: number
  content: string
  sender: string
  sender_profile_picture: string
  timestamp: string
  isOwn: boolean
  read: boolean
  is_edited: boolean
  is_deleted: boolean
  onEdit: (content: string) => void
  onDelete: () => void
}

export function MessageBubble({
  id,
  content,
  sender,
  sender_profile_picture,
  timestamp,
  isOwn,
  read,
  is_edited,
  is_deleted,
  onEdit,
  onDelete
}: MessageProps) {
  const [isLongPress, setIsLongPress] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    setIsLongPress(false)
  }

  const handleEdit = () => {
    onEdit(content)
    setIsLongPress(false)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete()
    }, 300) // Match this with the animation duration
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-2 mb-4 relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <Link href={`/profile/${sender}`}>
            <img
              src={`${process.env.BASE_URL_MD}${sender_profile_picture.startsWith('/media') ? '' : '/'}${sender_profile_picture}`}
              alt={sender}
              className="w-8 h-8 rounded-full cursor-pointer"
            />
          </Link>
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              isOwn
                ? 'bg-purple-600 text-white'
                : 'bg-[#2D2A3D] text-white'
            }`}
          >
            {!isOwn && (
              <div className="text-sm font-medium mb-1 text-purple-300">{sender}</div>
            )}
            {is_deleted ? (
              <div className="italic text-gray-500">This message was deleted</div>
            ) : (
              <div className="break-words">{content}</div>
            )}
            <div className="text-xs opacity-70 mt-1 text-gray-300 flex items-center justify-end">
              <span>{new Date(timestamp).toLocaleTimeString()}</span>
              {is_edited && <span className="ml-1 text-xs">(Edited)</span>}
              {isOwn && (
                <span className="ml-1">
                  {read ? (
                    <Check className="w-4 h-4 inline-block" />
                  ) : (
                    <Check className="w-4 h-4 inline-block opacity-50" />
                  )}
                </span>
              )}
            </div>
          </div>
          {isLongPress && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="flex space-x-4">
                <button onClick={handleCopy} className="p-2 bg-gray-500 rounded-full text-white hover:bg-gray-600">
                  <Copy className="w-5 h-5" />
                </button>
                {isOwn && (
                  <>
                    <button onClick={handleEdit} className="p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={handleDelete} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
