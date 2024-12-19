import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// ... existing code ...

export interface UserProfile {
  user: {
    username: string;
    email: string;
    is_online: boolean;
    last_seen: string;
    profile_picture: string;
    bio: string;
    is_owner: boolean;
  };
  profile: {
    date_of_birth?: string;
    gender?: string;
    location?: string;
    website?: string;
  };
}

// ... other existing types and functions ...


export const getUserProfile = async (username: string, token: string): Promise<UserProfile> => {
  try {
    if (!username) {
      throw new Error('Username is required');
    }

    const url = `${API_BASE_URL}/accounts/profile/${username}/`;
    console.log('Request URL:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};




// ... existing code ...

export async function updateUserProfile(updatedData: Partial<UserProfile>, token: string): Promise<UserProfile> {
  const response = await fetch('http://localhost:8000/api/accounts/profile/update/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
}