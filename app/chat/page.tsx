'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Moon, Plus, Phone, BookmarkIcon, Settings, Users, MessageSquare, X, Send, Paperclip, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { WebSocketManager } from '@/components/chat/WebSocketManager'

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
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState('disconnected'); // Added wsStatus
  const [wsError, setWsError] = useState<string | null>(null) // Added wsError state
  const webSocketRef = useRef<WebSocket | null>(null)
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem('fortify_access')
    const refreshToken = localStorage.getItem('fortify_refresh')

    if (!accessToken || !refreshToken) {
      router.push('/login')
      return
    }

    fetchChats()
  }, [router])

  useEffect(() => {
    if (selectedChat) {
      setWsStatus('connecting') // Update ws status on connection
    } else {
      setWsStatus('disconnected') // Update ws status on disconnection
    }
  }, [selectedChat])

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
      console.log('API Response:', response.data)
      setChats(response.data)
    } catch (error) {
      console.error('Error fetching chats:', error)
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401) {
            setError('Unauthorized. Please log in again.')
            router.push('/login')
          } else {
            setError(`Server error: ${error.response.status}. Please try again.`)
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError('No response from server. Please check your internet connection and try again.')
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        setError('An unknown error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }


  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case 'send':
        setMessages(prevMessages => [...prevMessages, {
          id: data.message_id,
          content: data.message,
          sender: data.sender,
          sender_profile_picture: data.sender_profile_picture,
          sender_bio: data.sender_bio,
          timestamp: new Date().toLocaleTimeString(),
          isOwn: data.sender === localStorage.getItem('username'),
          file: data.file
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
      case 'read':
        // Handle read receipts if needed
        break
    }
  }

  const sendMessage = () => {
    if (inputMessage.trim() && wsStatus === 'connected') {
      const message = {
        action: 'send',
        message: inputMessage
      }
      // Use the WebSocket instance from WebSocketManager
      const ws = (document.querySelector('[data-testid="websocket-manager"]') as any)?.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
        setInputMessage('')
      } else {
        console.error('WebSocket is not connected')
        // Optionally, show an error message to the user
      }
    }
  }

  const editMessage = (messageId: number, newContent: string) => {
    if (wsStatus === 'connected') { // Check WebSocket connection status
      const message = {
        action: 'edit',
        message_id: messageId,
        new_message: newContent
      }
      const ws = (document.querySelector('[data-testid="websocket-manager"]') as any)?.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        console.error('WebSocket is not connected')
      }
    }
  }

  const deleteMessage = (messageId: number) => {
    if (wsStatus === 'connected') { // Check WebSocket connection status
      const message = {
        action: 'delete',
        message_id: messageId
      }
      const ws = (document.querySelector('[data-testid="websocket-manager"]') as any)?.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        console.error('WebSocket is not connected')
      }
    }
  }

  const markAsRead = (messageId: number) => {
    if (wsStatus === 'connected') { // Check WebSocket connection status
      const message = {
        action: 'read',
        message_id: messageId
      }
      const ws = (document.querySelector('[data-testid="websocket-manager"]') as any)?.ws
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        console.error('WebSocket is not connected')
      }
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
              onClick={() => setSelectedChat(chat.id)}
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
              onClick={() => setSidebarOpen(false)}
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

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
                  onClick={() => setSelectedChat(null)}
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>
                <img
                  src={`http://localhost:8000${chats.find(chat => chat.id === selectedChat)?.chat_type === 'direct' 
                    ? chats.find(chat => chat.id === selectedChat)?.other_user.profile_picture 
                    : chats.find(chat => chat.id === selectedChat)?.group_image}`}
                  alt="Chat Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-white font-medium">
                    {chats.find(chat => chat.id === selectedChat)?.chat_type === 'direct'
                      ? chats.find(chat => chat.id === selectedChat)?.other_user.username
                      : chats.find(chat => chat.id === selectedChat)?.group_name}
                  </h3>
                  <p className="text-gray-400 text-sm">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {wsError && (
                <div className="p-2 bg-red-500 text-white text-center">
                  {wsError}
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start space-x-3 mb-4",
                    msg.isOwn && "flex-row-reverse space-x-reverse"
                  )}
                >
                  <img
                    src={`http://localhost:8000${msg.sender_profile_picture}`}
                    alt={msg.sender}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="max-w-[80%]">
                    <div className="text-sm text-gray-400">{msg.timestamp}</div>
                    <div
                      className={cn(
                        "text-sm p-3 rounded-lg",
                        msg.isOwn ? "bg-purple-500 text-white" : "bg-gray-800 text-white"
                      )}
                    >
                      {msg.content}
                      {msg.file && (
                        <div className="mt-2 text-xs">
                          <a href="#" className="text-blue-400 hover:underline">
                            {msg.file.file_name} ({(msg.file.file_size / 1024).toFixed(2)} KB)
                          </a>
                        </div>
                      )}
                    </div>
                    {msg.isOwn && (
                      <div className="flex justify-end mt-1 space-x-2">
                        <button onClick={() => editMessage(msg.id, prompt('Edit message:', msg.content) || msg.content)} className="text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMessage(msg.id)} className="text-gray-400 hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message"
                  className="flex-1 bg-[#1F1D2B] text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={sendMessage}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <Send className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Please select a chat to start messaging
          </div>
        )}
        {selectedChat && (
          <WebSocketManager
            url={`ws://localhost:8000/ws/chat/${selectedChat}/?token=${localStorage.getItem('fortify_access')}`}
            onMessage={handleWebSocketMessage}
            onStatusChange={(status) => {
              setWsStatus(status)
              if (status === 'disconnected') {
                setWsError('WebSocket disconnected. Trying to reconnect...')
              } else {
                setWsError(null)
              }
            }}
            onError={(error) => setWsError(`WebSocket error: ${error}`)}
          />
        )}
      </div>
    </div>
  )
}

