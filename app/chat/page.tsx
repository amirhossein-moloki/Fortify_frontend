"use client"
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect, useRef } from "react"
import {
  Menu,
  Search,
  Plus,
  Phone,
  BookmarkIcon,
  Settings,
  Users,
  MessageSquare,
  X,
  Send,
  Paperclip,
  Key,
  Sun,
  Moon,
  Trash,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import axios from "axios"
import { WebSocketManager } from "@/utils/WebSocketManager"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ProfileSection } from "@/components/profile/ProfileSection"
import { getUserProfile, type UserProfile, getChatParticipants, type ChatDetails, leaveChat } from "@/utils/api"
import Link from "next/link"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatInfo } from "@/components/chat/ChatInfo"
import { ImageModal } from "@/components/ui/ImageModal"
import { DeleteChatModal } from "@/components/chat/DeleteChatModal"
import { refreshToken } from "@/utils/auth"
import { useOnlineStatus } from "@/app/hooks/useOnlineStatus"

declare global {
  interface Window {
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
  }
}

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
  } | null
  other_user: {
    id: number
    profile_picture: string
    username: string
  }
  unread_count: number
  member_count: number
  is_admin: boolean
}

interface Message {
  id: number
  content: string
  sender: string
  sender_profile_picture: string
  sender_bio: string
  timestamp: string
  isOwn: boolean
  is_edited: boolean
  is_deleted: boolean
  read_by: string[]
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
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [selectedChatDetails, setSelectedChatDetails] = useState<ChatDetails | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false)
  const [usernames, setUsernames] = useState<string[]>([])
  const [token, setToken] = useState<string | null>(null)
  const onlineStatus = useOnlineStatus(usernames, token || "")
  const router = useRouter()
  const webSocketManagerRef = useRef<WebSocketManager | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sendAudioBufferRef = useRef<AudioBuffer | null>(null)
  const receiveAudioBufferRef = useRef<AudioBuffer | null>(null)
  const editAudioBufferRef = useRef<AudioBuffer | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const accessToken = localStorage.getItem("fortify_access")
    setToken(accessToken)
    const refreshToken = localStorage.getItem("fortify_refresh")
    const username = localStorage.getItem("fortify_username")

    if (!accessToken || !refreshToken || !username) {
      router.push("/login")
      return
    }

    setIsAuthenticated(true)
    fetchChats()
    fetchUserProfile(username, accessToken)

    webSocketManagerRef.current = new WebSocketManager(handleWebSocketMessage)

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioContextRef.current = new AudioContextClass()

    const loadAudio = async (url: string) => {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      return await audioContextRef.current!.decodeAudioData(arrayBuffer)
    }

    Promise.all([loadAudio("/send.mp3"), loadAudio("/receive.mp3"), loadAudio("/edit.mp3")])
      .then(([sendBuffer, receiveBuffer, editBuffer]) => {
        sendAudioBufferRef.current = sendBuffer
        receiveAudioBufferRef.current = receiveBuffer
        editAudioBufferRef.current = editBuffer
      })
      .catch((error) => {
        console.error("Error loading audio files:", error)
      })

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      webSocketManagerRef.current?.disconnect()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [router])

  useEffect(() => {
    const directChatUsernames = chats
      .filter((chat) => chat.chat_type === "direct")
      .map((chat) => chat.other_user.username)
    setUsernames(directChatUsernames)
  }, [chats, token])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const playSound = (buffer: AudioBuffer | null) => {
    if (buffer && audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = buffer
      source.connect(audioContextRef.current.destination)
      source.start()
    }
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case "send":
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg.id === data.message_id)) {
            return prevMessages
          }
          if (data.sender !== localStorage.getItem("fortify_username")) {
            playSound(receiveAudioBufferRef.current)
          } else {
            playSound(sendAudioBufferRef.current)
          }
          return [
            ...prevMessages,
            {
              id: data.message_id,
              content: data.message,
              sender: data.sender,
              sender_profile_picture: data.sender_profile_picture,
              sender_bio: data.sender_bio,
              timestamp: data.timestamp,
              isOwn: data.sender === localStorage.getItem("fortify_username"),
              is_edited: data.is_edited,
              is_deleted: data.is_deleted,
              read_by: data.read_by,
              file: data.file,
            },
          ]
        })
        break
      case "edit":
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === data.message_id ? { ...msg, content: data.message, is_edited: data.is_edited } : msg,
          ),
        )
        if (data.sender !== localStorage.getItem("fortify_username")) {
          playSound(editAudioBufferRef.current)
        }
        break
      case "delete":
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === data.message_id ? { ...msg, is_deleted: true } : msg)),
        )
        break
      case "read":
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === data.message_id ? { ...msg, read_by: data.read_by } : msg)),
        )
        break
      default:
        console.error("Unknown action:", data.action)
    }
  }

  const fetchChats = async () => {
    let token = localStorage.getItem("fortify_access")
    if (!token) {
      await handleTokenRefresh()
      token = localStorage.getItem("fortify_access")
      if (!token) {
        router.push("/login")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${process.env.BASE_URL}api/chats/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (Array.isArray(response.data) && response.data.length === 0) {
        setChats([])
        setError(null)
      } else {
        setChats(response.data)
        setError(null)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          await handleTokenRefresh()
          fetchChats() // Retry after refresh
        } else {
          setError(`Server error: ${error.response?.status}. Please try again.`)
        }
      } else {
        setError("An unknown error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleChatSelect = async (chatId: number) => {
    setSelectedChat(chatId)
    setMessages([])
    let token = localStorage.getItem("fortify_access")
    if (!token) {
      await handleTokenRefresh()
      token = localStorage.getItem("fortify_access")
      if (!token) {
        router.push("/login")
        return
      }
    }

    if (webSocketManagerRef.current) {
      webSocketManagerRef.current.disconnect()
      webSocketManagerRef.current.connect(chatId, token)
    }

    if (isMobileView) {
      setSidebarOpen(false)
    }

    try {
      const chatDetails = await getChatParticipants(chatId, token)
      setSelectedChatDetails(chatDetails)

      if (chatDetails.chat_type === "direct") {
        const otherUser = chatDetails.participants.find(
          (participant) => participant.username !== localStorage.getItem("fortify_username"),
        )
        if (otherUser) {
          chatDetails.other_user = otherUser
        }
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chats/chat/${chatId}/messages/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMessages(
        response.data.map((msg: any) => ({
          ...msg,
          isOwn: msg.sender === localStorage.getItem("fortify_username"),
        })),
      )
    } catch (error) {
      console.error("Error fetching chat details or messages:", error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await handleTokenRefresh()
        handleChatSelect(chatId) // Retry after refresh
      }
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
      setNewMessage("")
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

  useEffect(() => {
    if (selectedChat && webSocketManagerRef.current) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isOwn && !msg.read_by.includes(localStorage.getItem("fortify_username") || ""),
      )
      unreadMessages.forEach((msg) => {
        webSocketManagerRef.current?.markAsRead(msg.id)
      })
    }
  }, [selectedChat, messages])

  const fetchUserProfile = async (username: string, token: string) => {
    let currentToken = token
    if (!currentToken) {
      await handleTokenRefresh()
      currentToken = localStorage.getItem("fortify_access") || ""
      if (!currentToken) {
        router.push("/login")
        return
      }
    }
    try {
      const profileData = await getUserProfile(username, currentToken)
      setUserProfile(profileData)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          await handleTokenRefresh()
          fetchUserProfile(username, localStorage.getItem("fortify_access") || "")
        } else {
          setError(`Failed to fetch user profile. Server returned ${error.response.status}.`)
        }
      } else {
        setError("An unexpected error occurred while fetching the user profile.")
      }
    }
  }

  const handleProfileClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const handleCreateChat = () => {
    router.push("/create-chat")
  }

  const handleChatUpdate = (updatedChat: ChatDetails) => {
    setSelectedChatDetails(updatedChat)
    setChats((prevChats) => prevChats.map((chat) => (chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat)))
  }

  const handleLeaveChat = async () => {
    if (!selectedChat) return
    let token = localStorage.getItem("fortify_access")
    if (!token) {
      await handleTokenRefresh()
      token = localStorage.getItem("fortify_access")
      if (!token) {
        router.push("/login")
        return
      }
    }
    try {
      await leaveChat(selectedChat)
      setSelectedChat(null)
      fetchChats()
    } catch (error) {
      console.error("Error leaving chat:", error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await handleTokenRefresh()
        handleLeaveChat()
      } else {
        setError("Failed to leave the chat. Please try again.")
      }
    }
  }

  const handleDeleteChat = () => {
    setShowDeleteChatModal(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("fortify_access")
    localStorage.removeItem("fortify_refresh")
    localStorage.removeItem("fortify_username")
    router.push("/login")
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      let token = localStorage.getItem("fortify_access")
      if (!token) {
        await handleTokenRefresh()
        token = localStorage.getItem("fortify_access")
        if (!token) {
          router.push("/login")
          return
        }
      }
      try {
        const response = await axios.delete(`process.env.BASE_URLapi/accounts/delete-account/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 204) {
          alert("Your account has been successfully deleted.")
          handleLogout()
        }
      } catch (error) {
        console.error("Error deleting account:", error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await handleTokenRefresh()
          handleDeleteAccount()
        } else {
          alert("Failed to delete account. Please try again.")
        }
      }
    }
  }

  const handleTokenRefresh = async () => {
    const currentRefreshToken = localStorage.getItem("fortify_refresh")
    if (!currentRefreshToken) {
      console.error("No refresh token found")
      router.push("/login")
      return
    }

    try {
      const response = await refreshToken(currentRefreshToken)
      if (response.access_token) {
        localStorage.setItem("fortify_access", response.access_token)
        if (response.refresh_token) {
          localStorage.setItem("fortify_refresh", response.refresh_token)
        }
      } else {
        throw new Error("No access token received")
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
      router.push("/login")
    }
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen text-white">Authenticating...</div>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading chats...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-white">{error}</div>
  }

  return (
    <div className={cn("h-screen flex bg-[#1F1D2B]", nightMode && "dark")}>
      {/* Chat List */}
      {(!isMobileView || (isMobileView && !selectedChat)) && (
        <div className="w-full md:w-96 bg-[#2D2A3D] flex-shrink-0 border-r border-gray-800 relative overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <button onClick={toggleSidebar} className="p-2 hover:bg-gray-700 rounded-lg">
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-xl font-bold text-white">Chats</h2>
              <button onClick={handleCreateChat} className="p-2 hover:bg-gray-700 rounded-lg">
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

          <div className="overflow-y-auto h-[calc(100vh-5rem)]">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                <p className="mb-4">You don't have any chats yet.</p>
                <p>Start a new conversation by clicking the plus icon above!</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={cn(
                    "w-full p-4 flex items-center space-x-3 hover:bg-gray-800/50",
                    selectedChat === chat.id && "bg-gray-800/50",
                  )}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      if (chat.chat_type !== "direct") {
                        setEnlargedImage(
                          `${process.env.BASE_URL_MD}${chat.group_image.startsWith("/media") ? "" : "/"}${chat.group_image}`,
                        )
                      } else {
                        router.push(`/profile/${chat.other_user.username}`)
                      }
                    }}
                    className="relative"
                  >
                    <img
                      src={`${process.env.BASE_URL_MD}${((chat.chat_type === "direct" ? chat.other_user.profile_picture : chat.group_image) || "").startsWith("/media") ? "" : "/"}${chat.chat_type === "direct" ? chat.other_user.profile_picture : chat.group_image}`}
                      alt={chat.chat_type === "direct" ? chat.other_user.username : chat.group_name}
                      className="w-12 h-12 rounded-full cursor-pointer"
                    />
                    {chat.chat_type === "direct" && (
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                          onlineStatus[chat.other_user.username] ? "bg-green-500" : "bg-gray-500"
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium truncate">
                        {chat.chat_type === "direct" ? chat.other_user.username : chat.group_name}
                      </h3>
                      {chat.last_message && (
                        <span className="text-gray-400 text-sm flex-shrink-0">
                          {new Date(chat.last_message.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{chat.last_message?.content || ""}</p>
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {chat.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Sidebar Navigation */}
          <div
            className={cn(
              "absolute top-0 left-0 w-3/4 h-full bg-[#2D2A3D] transition-transform duration-300 ease-in-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              {userProfile && (
                <ProfileSection
                  userProfile={userProfile}
                  onNightModeToggle={() => setNightMode(!nightMode)}
                  nightMode={nightMode}
                  onProfileClick={handleProfileClick}
                />
              )}
              <nav className="space-y-2 p-4">
                {[
                  { icon: MessageSquare, label: "New Chat", onClick: handleCreateChat },
                  {
                    icon: nightMode ? Sun : Moon,
                    label: nightMode ? "Day Mode" : "Night Mode",
                    onClick: () => setNightMode(!nightMode),
                  },
                  { icon: Key, label: "Change Password", onClick: () => router.push("/change-password") },
                  { icon: LogOut, label: "Log Out", onClick: handleLogout },
                  { icon: Trash, label: "Delete Account", onClick: handleDeleteAccount },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center space-x-3 w-full p-2 rounded-lg text-gray-400 hover:bg-purple-500/10 hover:text-purple-500"
                    onClick={item.onClick}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      {(!isMobileView || (isMobileView && selectedChat)) && (
        <div className="flex-1 bg-[#1F1D2B] flex flex-col">
          {selectedChat && selectedChatDetails ? (
            <>
              <ChatHeader
                chatId={selectedChat}
                chatType={selectedChatDetails.chat_type}
                chatName={
                  selectedChatDetails.chat_type === "direct"
                    ? selectedChatDetails.other_user?.username || ""
                    : selectedChatDetails.group_name || ""
                }
                username={
                  selectedChatDetails.chat_type === "direct" ? selectedChatDetails.other_user?.username || "" : ""
                }
                memberCount={selectedChatDetails.participants.length}
                profilePicture={
                  selectedChatDetails.chat_type === "direct"
                    ? selectedChatDetails.other_user?.profile_picture || ""
                    : selectedChatDetails.group_image || ""
                }
                isAdmin={
                  selectedChatDetails.group_admin?.some((admin) => admin.id === userProfile?.profile.user.id) || false
                }
                isMobileView={isMobileView}
                onBackClick={() => setSelectedChat(null)}
                onChatUpdate={handleChatUpdate}
                onLeaveChat={handleLeaveChat}
                isOnline={
                  selectedChatDetails.chat_type === "direct"
                    ? onlineStatus[selectedChatDetails.other_user?.username || ""]
                    : undefined
                }
              />

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
                    read={message.read_by.includes(localStorage.getItem("fortify_username") || "")}
                    is_edited={message.is_edited}
                    is_deleted={message.is_deleted}
                    onEdit={(newContent) => handleStartEdit(message.id, newContent)}
                    onDelete={() => handleDeleteMessage(message.id)}
                  />
                ))}
                <div ref={messagesEndRef} />
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
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
                    className="flex-1 bg-[#2D2A3D] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {editingMessageId && (
                    <button
                      onClick={() => {
                        setEditingMessageId(null)
                        setNewMessage("")
                      }}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingMessageId ? "Update" : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a chat to start a conversation
            </div>
          )}
        </div>
      )}

      {showChatInfo && selectedChatDetails && (
        <ChatInfo chatId={selectedChat!} onClose={() => setShowChatInfo(false)} />
      )}
      {enlargedImage && <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />}
      {showDeleteChatModal && selectedChat && (
        <DeleteChatModal
          chatId={selectedChat}
          onClose={() => setShowDeleteChatModal(false)}
          onDelete={async () => {
            try {
              await axios.delete(`${process.env.BASE_URL}api/chats/${selectedChat}/`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("fortify_access")}`,
                },
              })
              setSelectedChat(null)
              fetchChats()
              setShowDeleteChatModal(false)
            } catch (error) {
              console.error("Error deleting chat:", error)
              setError("Failed to delete the chat. Please try again.")
            }
          }}
        />
      )}
    </div>
  )
}

