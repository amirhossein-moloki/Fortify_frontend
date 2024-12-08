import { Chat } from './layout'
import Image from 'next/image'

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
}

export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  return (
    <div className="overflow-y-auto h-[calc(100vh-73px)]">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={`w-full p-4 flex items-start gap-3 hover:bg-[#2D2A3D] transition-colors ${
            selectedChat?.id === chat.id ? 'bg-[#2D2A3D]' : ''
          }`}
        >
          <Image
            src={chat.avatar}
            alt={chat.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-white font-medium truncate">{chat.name}</h3>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {chat.lastMessage.timestamp}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate">{chat.lastMessage.content}</p>
          </div>
          {chat.unread && (
            <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {chat.unread}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

