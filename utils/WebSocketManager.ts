type WebSocketMessage = {
    action: 'send' | 'edit' | 'delete';
    message_id?: number;
    message?: string;
    sender?: string;
    sender_profile_picture?: string;
    timestamp?: string;
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
      this.sendAction('edit', { message_id: messageId, message: newContent });
    }
  
    deleteMessage(messageId: number) {
      this.sendAction('delete', { message_id: messageId });
    }
  
    private sendAction(action: 'send' | 'edit' | 'delete', data: Partial<WebSocketMessage>) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action, ...data }));
      } else {
        console.error('WebSocket is not connected');
      }
    }
  }
  
  