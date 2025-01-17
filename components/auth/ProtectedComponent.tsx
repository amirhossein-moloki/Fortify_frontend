import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function ProtectedComponent() {
  const { isRefreshing, refreshToken } = useTokenRefresh();
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          const refreshSuccessful = await refreshToken();
          if (!refreshSuccessful) return;
        }
        
        const response = await axios.get('http://localhost:8000/api/protected-data', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          const refreshSuccessful = await refreshToken();
          if (refreshSuccessful) {
            fetchData(); // Retry fetching data after successful token refresh
          }
        }
      }
    };

    fetchData();
  }, [refreshToken]);

  if (isRefreshing) {
    return <div>Refreshing token...</div>;
  }

  return (
    <div>
      <h1>Protected Data</h1>
      {data ? <p>{data}</p> : <p>Loading data...</p>}
    </div>
  );
}

