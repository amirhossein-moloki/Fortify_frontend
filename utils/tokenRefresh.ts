import axios from 'axios';

export async function refreshToken() {
  const refreshToken = localStorage.getItem('fortify_refresh');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post('${process.env.BASE_URL}api/accounts/token/refresh-both/', {
      refresh_token: refreshToken
    });

    const { access_token, refresh_token } = response.data;

    localStorage.setItem('fortify_access', access_token);
    if (refresh_token) {
      localStorage.setItem('fortify_refresh', refresh_token);
    }

    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

