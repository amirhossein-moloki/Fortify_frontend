'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import ChatList from './chat-list'
import ChatArea from './chat-area'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: Message
  unread?: number
}

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Sample data
  const chats: Chat[] = [
    {
      id: '1',
      name: 'ISOVPN_SUP',
      avatar: '/placeholder.svg?height=40&width=40',
      lastMessage: {
        id: '1',
        content: 'چطور میتونم کمک کنم؟',
        sender: 'ISOVPN_SUP',
        timestamp: '10:23 PM',
        isOwn: false,
        status: 'read'
      },
      unread: 2
    },
    // Add more chat examples as needed
  ]

  return (
    <div className="flex h-screen bg-[#1F1D2B]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Chat List */}
      <div className="w-full md:w-80 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-400"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-[#2D2A3D] border-0 text-white placeholder-gray-400 w-full"
              />
            </div>
          </div>
        </div>
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 ${!selectedChat ? 'hidden md:block' : ''}`}>
        {selectedChat ? (
          <ChatArea chat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

