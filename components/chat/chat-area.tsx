import { useState } from 'react'
import { Chat } from './layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import Image from 'next/image'

interface ChatAreaProps {
  chat: Chat
  onBack: () => void
}

export default function ChatArea({ chat, onBack }: ChatAreaProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden text-gray-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Image
          src={chat.avatar}
          alt={chat.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h2 className="text-white font-medium">{chat.name}</h2>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Sample messages - replace with actual messages */}
        <div className="flex justify-start">
          <div className="bg-[#2D2A3D] text-white rounded-lg p-3 max-w-[80%]">
            <p>سلام! چطور میتونم کمکتون کنم؟</p>
            <span className="text-xs text-gray-400 mt-1 block">10:23 PM</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-purple-500 text-white rounded-lg p-3 max-w-[80%]">
            <p>سلام، ممنون. یه سوال داشتم</p>
            <span className="text-xs text-gray-400 mt-1 block">10:24 PM</span>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-[#2D2A3D] border-0 text-white placeholder-gray-400"
          />
          <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

