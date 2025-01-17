export interface Message {
    id: string
    content: string
    sender: string
    timestamp: string
    isOwn: boolean
    status: 'sent' | 'delivered' | 'read'
    sender_profile_picture: string
    file?: {
      file_name: string
      file_type: string
      file_size: number
    }
  }
  
  export interface Chat {
    id: string
    name: string
    avatar: string
    lastMessage: Message
    unread?: number
    chat_type: 'direct' | 'group'
    other_user?: {
      id: number
      profile_picture: string
      username: string
    }
    group_image?: string
    group_name?: string
  }
  