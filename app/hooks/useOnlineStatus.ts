import { useState, useEffect } from 'react';

interface OnlineStatus {
  [username: string]: boolean;
}

export const useOnlineStatus = (usernames: string[]): OnlineStatus => {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});

  useEffect(() => {
    const connections: { [username: string]: WebSocket } = {};

    usernames.forEach(username => {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/status/${username}/`);

      ws.onopen = () => {
        setOnlineStatus(prev => ({ ...prev, [username]: true }));
      };

      ws.onclose = () => {
        setOnlineStatus(prev => ({ ...prev, [username]: false }));
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${username}:`, error);
        setOnlineStatus(prev => ({ ...prev, [username]: false }));
      };

      connections[username] = ws;
    });

    return () => {
      Object.values(connections).forEach(ws => ws.close());
    };
  }, [usernames]);

  return onlineStatus;
};

