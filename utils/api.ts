import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface UserProfile {
  is_owner: boolean;
  profile: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      is_online: boolean;
      last_seen: string;
      profile_picture: string;
      bio: string;
    };
    date_of_birth?: string;
    gender?: string;
    location?: string;
    website?: string;
  };
}

export type PartialUserProfile = Partial<Omit<UserProfile['profile'], 'user'>> & {
  user?: Partial<UserProfile['profile']['user']>;
  profile_picture?: File;
};

export const getUserProfile = async (username: string, token: string): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/accounts/profile/${username}/`, {
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

export const updateUserProfile = async (updatedData: PartialUserProfile, token: string): Promise<UserProfile> => {
  try {
    const formData = new FormData();
    
    if (updatedData.user) {
      Object.entries(updatedData.user).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`user.${key}`, String(value));
        }
      });
    }
    
    Object.entries(updatedData).forEach(([key, value]) => {
      if (key !== 'user' && key !== 'profile_picture' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    if (updatedData.profile_picture) {
      formData.append('profile_picture', updatedData.profile_picture);
    }

    const response = await axios.patch(`${API_BASE_URL}/accounts/profile/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export interface ChatMember {
  id: number;
  username: string;
  profile_picture: string;
  role: 'admin' | 'member';
  is_online: boolean;
  last_seen: string;
}

export const getChatMembers = async (chatId: number, token: string): Promise<ChatMember[]> => {
  try {
    console.log('Sending request to get chat members:', `${API_BASE_URL}/chats/chat/${chatId}/alluser/`);
    const response = await axios.get(`${API_BASE_URL}/chats/chat/${chatId}/alluser/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Received response for getChatMembers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat members:', error);
    throw error;
  }
};

export interface ChatParticipant {
  id: number;
  username: string;
  email: string;
  profile_picture: string;
  is_online: boolean;
  last_seen: string;
}

export interface ChatDetails {
  id: number;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
  chat_type: string;
  group_name: string;
  group_admin: ChatParticipant[];
  group_image: string;
  max_participants: number;
  description: string;
  other_user?: ChatParticipant;
}

export const getChatParticipants = async (chatId: number, token: string): Promise<ChatDetails> => {
  try {
    console.log('Sending request to get chat participants:', `${API_BASE_URL}/chats/chat/${chatId}/participants/`);
    const response = await axios.get(`${API_BASE_URL}/chats/chat/${chatId}/participants/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Received response for getChatParticipants:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat participants:', error);
    throw error;
  }
};

export const removeUsersFromChat = async (chatId: number, usernames: string[], token: string): Promise<{ success: boolean, removed_users: string[] }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chats/chat/${chatId}/remove-users/`, 
      { usernames },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          throw new Error('Invalid usernames or users not found.');
        } else if (status === 401) {
          throw new Error('Unauthorized. Please check your token.');
        } else if (status === 403) {
          throw new Error('You are not authorized to remove users from this chat.');
        } else if (status === 404) {
          throw new Error('Chat not found.');
        } else {
          throw new Error(`An error occurred: ${error.response.data?.detail || 'Unknown error'}`);
        }
      } else {
        throw new Error('Network error or server unreachable.');
      }
    }
    console.error('Error removing users from chat:', error);
    throw error;
  }
};

export async function updateChat(chatId: number, data: FormData, token: string): Promise<ChatDetails> {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/chats/chat/${chatId}/update/`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
}

export const leaveChat = async (chatId: number): Promise<void> => {
  const token = localStorage.getItem('fortify_access');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/chats/chat/${chatId}/leave/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to leave the chat');
    }
  } catch (error) {
    console.error('Error leaving chat:', error);
    throw error;
  }
};

