import React from 'react';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface TokenRefreshWrapperProps {
  children: React.ReactNode;
}

export function TokenRefreshWrapper({ children }: TokenRefreshWrapperProps) {
  const { isRefreshing } = useTokenRefresh();

  if (isRefreshing) {
    return <div>در حال تازه کردن توکن...</div>;
  }

  return <>{children}</>;
}

