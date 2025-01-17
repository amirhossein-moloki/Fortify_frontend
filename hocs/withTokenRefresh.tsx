import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function withTokenRefresh<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithTokenRefresh(props: T) {
    const { isRefreshing, refreshToken } = useTokenRefresh();
    const router = useRouter();

    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        refreshToken();
      }
    }, [refreshToken]);

    if (isRefreshing) {
      return <div></div>;
    }

    return <WrappedComponent {...props} />;
  };
}

