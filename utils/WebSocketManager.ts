type WebSocketMessage = {
  action: 'send' | 'edit' | 'delete' | 'read';
  message_id?: number;
  message?: string;
  sender?: string;
  sender_profile_picture?: string;
  sender_bio?: string;
  timestamp?: string;
  new_message?: string;
  read_by?: string[];
  is_edited?: boolean;
  is_deleted?: boolean;
  file?: {
    file_name: string;
    file_type: string;
    file_size: number;
  };
};

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private chatId: number | null = null;
  private token: string | null = null;

  constructor(private onMessage: (data: WebSocketMessage) => void) {}

  connect(chatId: number, token: string) {
    this.chatId = chatId;
    this.token = token;
    this.socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.socket.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      this.onMessage(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket Closed');
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(content: string) {
    this.sendAction('send', { message: content });
  }

  editMessage(messageId: number, newContent: string) {
    this.sendAction('edit', { message_id: messageId, new_message: newContent });
  }

  deleteMessage(messageId: number) {
    this.sendAction('delete', { message_id: messageId });
  }

  markAsRead(messageId: number) {
    this.sendAction('read', { message_id: messageId });
  }

  private sendAction(action: 'send' | 'edit' | 'delete' | 'read', data: Partial<WebSocketMessage>) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...data }));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}
