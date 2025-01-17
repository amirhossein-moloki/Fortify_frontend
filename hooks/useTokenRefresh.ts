import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const REFRESH_URL = 'http://localhost:8000/api/accounts/token/refresh-both/';

export function useTokenRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const refreshToken = useCallback(async () => {
    setIsRefreshing(true);
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      router.push('/login');
      return false;
    }

    try {
      const response = await axios.post(REFRESH_URL, {
        refresh: refreshToken
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      setIsRefreshing(false);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
      setIsRefreshing(false);
      return false;
    }
  }, [router]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        await refreshToken();
      }
    };

    checkTokenValidity();
  }, [refreshToken]);

  return { isRefreshing, refreshToken };
}

