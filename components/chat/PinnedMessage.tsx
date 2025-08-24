'use client'

import { Pin, X } from 'lucide-react'

interface PinnedMessageProps {
  content: string;
  onUnpin: () => void;
}

export function PinnedMessage({ content, onUnpin }: PinnedMessageProps) {
  return (
    <div className="p-2 bg-purple-900/50 text-white flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Pin className="w-4 h-4 text-yellow-400" />
        <p className="text-sm truncate">{content}</p>
      </div>
      <button onClick={onUnpin} className="p-1 hover:bg-purple-800 rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
