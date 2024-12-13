'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Moon, Plus, Phone, BookmarkIcon, Settings, Users, MessageSquare, X, Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { WebSocketManager } from '@/utils/WebSocketManager'
import { MessageBubble } from '@/components/chat/MessageBubble'

interface Chat {
  id: number
  chat_type: string
  group_image: string
  group_name: string
  last_message: {
    content: string
    id: number
    sender: {
      id: number
      username: string
    }
    timestamp: string
  }
  other_user: {
    id: number
    profile_picture: string
    username: string
  }
  unread_count: number
}

interface Message {
  id: number
  content: string
  sender: string
  sender_profile_picture: string
  sender_bio: string
  timestamp: string
  isOwn: boolean
  file?: {
    file_name: string
    file_type: string
    file_size: number
  }
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [nightMode, setNightMode] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const router = useRouter()
  const webSocketManagerRef = useRef<WebSocketManager | null>(null)

  useEffect(() => {
    const accessToken = localStorage.getItem('fortify_access')
    const refreshToken = localStorage.getItem('fortify_refresh')

    if (!accessToken || !refreshToken) {
      router.push('/login')
      return
    }

    fetchChats()

    webSocketManagerRef.current = new WebSocketManager(handleWebSocketMessage)

    return () => {
      webSocketManagerRef.current?.disconnect()
    }
  }, [router])

  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case 'send':
        setMessages(prevMessages => [...prevMessages, {
          id: data.message_id,
          content: data.message,
          sender: data.sender,
          sender_profile_picture: data.sender_profile_picture,
          sender_bio: data.sender_bio,
          timestamp: data.timestamp,
          isOwn: data.sender === localStorage.getItem('fortify_username')
        }])
        break
      case 'edit':
        setMessages(prevMessages => prevMessages.map(msg =>
          msg.id === data.message_id ? { ...msg, content: data.message } : msg
        ))
        break
      case 'delete':
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== data.message_id))
        break
      default:
        console.error('Unknown action:', data.action)
    }
  }

  const fetchChats = async () => {
    const token = localStorage.getItem('fortify_access')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('http://localhost:8000/api/chats/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setChats(response.data)
    } catch (error) {
      console.error('Error fetching chats:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Unauthorized. Please log in again.')
          router.push('/login')
        } else {
          setError(`Server error: ${error.response?.status}. Please try again.`)
        }
      } else {
        setError('An unknown error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId)
    const token = localStorage.getItem('fortify_access')
    if (token && webSocketManagerRef.current) {
      webSocketManagerRef.current.disconnect()
      webSocketManagerRef.current.connect(chatId, token)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && webSocketManagerRef.current) {
      if (editingMessageId) {
        webSocketManagerRef.current.editMessage(editingMessageId, newMessage.trim())
        setEditingMessageId(null)
      } else {
        webSocketManagerRef.current.sendMessage(newMessage.trim())
      }
      setNewMessage('')
    }
  }

  const handleStartEdit = (messageId: number, content: string) => {
    setEditingMessageId(messageId)
    setNewMessage(content)
  }

  const handleDeleteMessage = (messageId: number) => {
    if (webSocketManagerRef.current) {
      webSocketManagerRef.current.deleteMessage(messageId)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading chats...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-white">{error}</div>
  }

  return (
    <div className={cn(
      "h-screen flex bg-[#1F1D2B]",
      nightMode && "dark"
    )}>
      {/* Chat List and Sidebar */}
      <div className="w-full md:w-96 bg-[#2D2A3D] flex-shrink-0 border-r border-gray-800 relative overflow-hidden">
        {/* Chat List Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-white">Chats</h2>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-[#1F1D2B] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-5rem)]">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={cn(
                "w-full p-4 flex items-center space-x-3 hover:bg-gray-800/50",
                selectedChat === chat.id && "bg-gray-800/50"
              )}
            >
              <img
                src={`http://localhost:8000${chat.chat_type === 'direct' ? chat.other_user.profile_picture : chat.group_image}`}
                alt={chat.chat_type === 'direct' ? chat.other_user.username : chat.group_name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-medium truncate">
                    {chat.chat_type === 'direct' ? chat.other_user.username : chat.group_name}
                  </h3>
                  <span className="text-gray-400 text-sm flex-shrink-0">
                    {new Date(chat.last_message?.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm truncate">{chat.last_message?.content}</p>
              </div>
              {chat.unread_count > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {chat.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Navigation */}
        <div className={cn(
          "absolute top-0 left-0 w-3/4 h-full bg-[#2D2A3D] transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={()=> setSidebarOpen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/placeholder.svg?height=40&width=40"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-white font-medium">Your Name</h3>
                <p className="text-gray-400 text-sm">Online</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {[ 
                { icon: MessageSquare, label: "All Chats" },
                { icon: Users, label: "New Group" },
                { icon: MessageSquare, label: "New Channel" },
                { icon: Users, label: "Contacts" },
                { icon: Phone, label: "Calls" },
                { icon: BookmarkIcon, label: "Saved Messages" },
                { icon: Settings, label: "Settings" },
              ].map((item, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-400 hover:bg-purple-500/10 hover:text-purple-500"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={() => setNightMode(!nightMode)}
                className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-400 hover:bg-purple-500/10 hover:text-purple-500"
              >
                <Moon className="w-5 h-5" />
                <span>Night Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#1F1D2B] flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <img
                  src={`http://localhost:8000${chats.find(c => c.id === selectedChat)?.other_user.profile_picture}`}
                  alt={chats.find(c => c.id === selectedChat)?.other_user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="text-white font-medium">
                    {chats.find(c => c.id === selectedChat)?.other_user.username}
                  </h2>
                  <p className="text-gray-400 text-sm">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  sender={message.sender}
                  sender_profile_picture={message.sender_profile_picture}
                  timestamp={message.timestamp}
                  isOwn={message.isOwn}
                  onEdit={(newContent) => handleStartEdit(message.id, newContent)}
                  onDelete={() => handleDeleteMessage(message.id)}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={editingMessageId ? "پیام را ویرایش کنید..." : "پیام خود را بنویسید..."}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            یک چت را برای شروع گفتگو انتخاب کنید
          </div>
        )}
      </div>
    </div>
  )
}

