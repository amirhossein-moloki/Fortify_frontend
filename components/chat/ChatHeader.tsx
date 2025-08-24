'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, MoreVertical, LogOut, Phone, Video } from 'lucide-react'
import Link from 'next/link'
import { ChatInfo } from './ChatInfo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { ChatDetails } from '@/utils/api';
import { PinnedMessage } from './PinnedMessage';

interface PinnedMessageData {
  id: number;
  content: string;
}

interface ChatHeaderProps {
  chatId: number;
  chatType: string;
  chatName: string;
  username: string;
  memberCount: number;
  profilePicture: string;
  isAdmin: boolean;
  isMobileView?: boolean;
  pinnedMessage?: PinnedMessageData | null;
  onBackClick?: () => void;
  onChatUpdate: (updatedChat: ChatDetails) => void;
  onLeaveChat: () => void;
  onUnpinMessage: (messageId: number) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  isOnline?: boolean;
}

export function ChatHeader({
  chatId,
  chatType,
  chatName,
  username,
  memberCount,
  profilePicture,
  isAdmin,
  isMobileView,
  pinnedMessage,
  onBackClick,
  onChatUpdate,
  onLeaveChat,
  onUnpinMessage,
  onStartCall,
  isOnline
}: ChatHeaderProps) {
  const [showInfo, setShowInfo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getProfilePictureUrl = (url: string | undefined) => {
    if (!url) return '/placeholder.svg?height=40&width=40';
    if (url.startsWith('${process.env.BASE_URL_MD}')) {
      return url;
    } else if (url.startsWith('/media')) {
      return `${process.env.BASE_URL_MD}${url}`;
    } else {
      return `${process.env.BASE_URL}${url}`;
    }
  }

  const isDirectChat = chatType === 'direct';

  return (
    <div className="border-b border-gray-800">
      {pinnedMessage && (
        <PinnedMessage
          content={pinnedMessage.content}
          onUnpin={() => onUnpinMessage(pinnedMessage.id)}
        />
      )}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          {isMobileView && (
            <button
              onClick={onBackClick}
              className="p-2 mr-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {chatName && (
            <div className="relative">
              <img
                src={getProfilePictureUrl(profilePicture)}
                alt={chatName || 'Chat'}
                className="w-10 h-10 rounded-full cursor-pointer object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-white font-medium mr-2">{chatName || 'Unknown'}</h2>
            </div>
            <p className="text-gray-400 text-sm">
              {isDirectChat
                ? (isOnline ? 'Online' : 'Offline')
                : `${memberCount} members`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isDirectChat && (
              <>
                <button
                  onClick={() => onStartCall('audio')}
                  className="p-2 text-gray-400 hover:text-white"
                  title="Start Audio Call"
                >
                  <Phone className="w-6 h-6" />
                </button>
                <button
                  onClick={() => onStartCall('video')}
                  className="p-2 text-gray-400 hover:text-white"
                  title="Start Video Call"
                >
                  <Video className="w-6 h-6" />
                </button>
              </>
            )}
            {!isDirectChat && (
              <>
                <button
                  onClick={onLeaveChat}
                  className="p-2 text-gray-400 hover:text-white"
                  title="Leave Chat"
                >
                  <LogOut className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowInfo(true)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showInfo && (
        <ChatInfo
          chatId={chatId}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  )
}
