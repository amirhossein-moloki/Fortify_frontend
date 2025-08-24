type WebSocketMessage = {
  action: 'send' | 'edit' | 'delete' | 'read' | 'react' | 'create_poll' | 'vote_poll' | 'pin_message' | 'unpin_message' | 'start_call' | 'webrtc_offer' | 'webrtc_answer' | 'webrtc_ice_candidate' | 'reject_call' | 'end_call';
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
  emoji?: string;
  question?: string;
  options?: string[];
  poll_id?: number;
  option_id?: number;
  call_type?: 'audio' | 'video';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
  file?: {
    file_name: string;
    file_type: string;
    file_size: number;
  };
};

const BASE_URL = 'wss://fortify-c8os.onrender.com/';


export class WebSocketManager {
  private socket: WebSocket | null = null;
  private chatId: number | null = null;
  private token: string | null = null;

  constructor(private onMessage: (data: any) => void) {}

  connect(chatId: number, token: string) {
    this.chatId = chatId;
    this.token = token;
    this.socket = new WebSocket(`${BASE_URL}ws/chat/${chatId}/?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
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

  sendReaction(messageId: number, emoji: string) {
    this.sendAction('react', { message_id: messageId, emoji: emoji });
  }

  createPoll(question: string, options: string[]) {
    this.sendAction('create_poll', { question, options });
  }

  votePoll(pollId: number, optionId: number) {
    this.sendAction('vote_poll', { poll_id: pollId, option_id: optionId });
  }

  pinMessage(messageId: number) {
    this.sendAction('pin_message', { message_id: messageId });
  }

  unpinMessage(messageId: number) {
    this.sendAction('unpin_message', { message_id: messageId });
  }

  startCall(type: 'audio' | 'video') {
    this.sendAction('start_call', { call_type: type });
  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.sendAction('webrtc_offer', { offer });
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    this.sendAction('webrtc_answer', { answer });
  }

  sendIceCandidate(candidate: RTCIceCandidate) {
    this.sendAction('webrtc_ice_candidate', { candidate });
  }

  rejectCall() {
    this.sendAction('reject_call', {});
  }

  endCall() {
    this.sendAction('end_call', {});
  }

  private sendAction(action: 'send' | 'edit' | 'delete' | 'read' | 'react' | 'create_poll' | 'vote_poll' | 'pin_message' | 'unpin_message' | 'start_call' | 'webrtc_offer' | 'webrtc_answer' | 'webrtc_ice_candidate' | 'reject_call' | 'end_call', data: Partial<WebSocketMessage>) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...data }));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}
