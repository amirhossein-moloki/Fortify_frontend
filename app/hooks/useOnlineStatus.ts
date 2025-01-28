import { useState, useEffect } from 'react';

interface OnlineStatus {
  [username: string]: boolean;
}
const BASE_URL = 'wss://fortify-c8os.onrender.com/';
export const useOnlineStatus = (usernames: string[], token: string): OnlineStatus => {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});

  useEffect(() => {
    const connections: { [username: string]: WebSocket } = {};

    usernames.forEach(username => {
      const wsUrl = `${BASE_URL}ws/status/${username}/?token=${token}`;


      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
   
        setOnlineStatus(prev => ({ ...prev, [username]: true }));
      };

      ws.onclose = () => {
       
        setOnlineStatus(prev => ({ ...prev, [username]: false }));
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${username}:`, error);
        setOnlineStatus(prev => ({ ...prev, [username]: false }));
        alert('Failed to connect to WebSocket!');
      };
      

      connections[username] = ws;
    });

    return () => {
      Object.values(connections).forEach(ws => {
       
        ws.close();
      });
    };
  }, [usernames, token]);

  return onlineStatus;
};
