import axios from 'axios';

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
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
