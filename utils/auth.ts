import axios from 'axios';

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    console.log("--- DEMO MODE: Mocking token refresh ---");
    return Promise.resolve({
      access_token: 'mock_access_token_refreshed',
      refresh_token: 'mock_refresh_token_refreshed',
    });
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.BASE_URL}api/accounts/token/refresh-both/`,
      { refresh_token: refreshToken }
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}
