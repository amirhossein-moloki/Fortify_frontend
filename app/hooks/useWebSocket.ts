import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  action: string;
  message_id?: number;
  message?: string;
  sender?: string;
  sender_profile_picture?: string;
  sender_bio?: string;
  file?: {
    file_name: string;
    file_type: string;
    file_size: number;
  };
}

export const useWebSocket = (chatId: number | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!chatId) return;

    const token = localStorage.getItem('fortify_access');
    if (!token) {
      console.error('No access token found');
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    webSocketRef.current = ws;

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [chatId]);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.action) {
      case 'send':
        setMessages(prevMessages => [...prevMessages, data]);
        break;
      case 'edit':
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.message_id === data.message_id ? { ...msg, message: data.message } : msg
        ));
        break;
      case 'delete':
        setMessages(prevMessages => prevMessages.filter(msg => msg.message_id !== data.message_id));
        break;
      case 'read':
        // Handle read receipts if needed
        break;
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify({
        action: 'send',
        message: content
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  return { isConnected, messages, sendMessage };
};

