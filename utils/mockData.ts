import { UserProfile, ChatDetails, ChatParticipant } from './api';

// --- MOCK DATA GENERATION ---

// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Mock user data
const mockUsers: ChatParticipant[] = [
  {
    id: 1,
    username: 'You',
    email: 'you@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=you',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'Alice',
    email: 'alice@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=alice',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: 3,
    username: 'Bob',
    email: 'bob@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=bob',
    is_online: false,
    last_seen: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 4,
    username: 'Charlie',
    email: 'charlie@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=charlie',
    is_online: true,
    last_seen: new Date().toISOString(),
  },
  {
    id: 5,
    username: 'Diana',
    email: 'diana@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=diana',
    is_online: false,
    last_seen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 6,
    username: 'Ethan',
    email: 'ethan@test.com',
    profile_picture: 'https://i.pravatar.cc/150?u=ethan',
    is_online: true,
    last_seen: new Date().toISOString(),
  }
];

export const mockMyProfile: UserProfile = {
  is_owner: true,
  profile: {
    id: 1,
    user: {
      id: 1,
      username: 'You',
      email: 'you@test.com',
      is_online: true,
      last_seen: new Date().toISOString(),
      profile_picture: 'https://i.pravatar.cc/150?u=you',
      bio: 'This is my awesome profile bio for the demo mode!',
    },
    date_of_birth: '1990-01-01',
    gender: 'Other',
    location: 'San Francisco, CA',
    website: 'https://example.com',
  },
};

// Mock messages
const createMockMessage = (id: number, sender: ChatParticipant, content: string, timestamp: Date, isOwn: boolean, extras: any = {}) => ({
  id,
  content,
  sender: sender.username,
  sender_profile_picture: sender.profile_picture,
  sender_bio: `Bio of ${sender.username}`,
  timestamp: timestamp.toISOString(),
  isOwn,
  is_edited: false,
  is_deleted: false,
  read_by: ['You', sender.username],
  reactions: [],
  ...extras,
});

const now = new Date();

export const mockMessages: { [chatId: number]: any[] } = {
  101: [ // Chat with Alice
    createMockMessage(1, mockUsers[1], 'Hey! How are you doing?', new Date(now.getTime() - 60000 * 10), false),
    createMockMessage(2, mockUsers[0], 'I am good, thanks for asking! Just working on this cool messenger app.', new Date(now.getTime() - 60000 * 9), true),
    createMockMessage(3, mockUsers[1], 'Oh wow, that sounds amazing! Can you show me a screenshot?', new Date(now.getTime() - 60000 * 8), false),
    createMockMessage(4, mockUsers[0], 'Sure, here is one!', new Date(now.getTime() - 60000 * 7), true, {
      file: { file_name: 'screenshot.jpg', file_type: 'image/jpeg', file_size: 123456 }
    }),
    createMockMessage(5, mockUsers[1], 'Looks fantastic! The UI is so clean.', new Date(now.getTime() - 60000 * 6), false),
  ],
  102: [ // Chat with Bob
    createMockMessage(1, mockUsers[2], 'Can you send me the report?', new Date(now.getTime() - 86400000), false),
    createMockMessage(2, mockUsers[0], 'Yes, here it is.', new Date(now.getTime() - 86300000), true, {
      file: { file_name: 'report.pdf', file_type: 'application/pdf', file_size: 54321 }
    }),
  ],
  201: [ // Group Chat: "Project Team"
    createMockMessage(1, mockUsers[3], "Hey team, what's the status on the new feature?", new Date(now.getTime() - 60000 * 30), false),
    createMockMessage(2, mockUsers[4], "I've pushed the latest commits.", new Date(now.getTime() - 60000 * 25), false),
    createMockMessage(3, mockUsers[0], "Great, I'll review them now. Thanks Diana!", new Date(now.getTime() - 60000 * 24), true),
    createMockMessage(4, mockUsers[5], "I'm working on the documentation for it.", new Date(now.getTime() - 60000 * 20), false),
    createMockMessage(5, mockUsers[3], "Perfect! Let's sync up later today.", new Date(now.getTime() - 60000 * 19), false),
     createMockMessage(6, mockUsers[0], "Sounds good. I have created a poll to decide on the new logo.", new Date(now.getTime() - 60000 * 18), true, {
      poll: {
        id: 1,
        question: "Which logo do you prefer?",
        options: [
          { id: 1, text: "Option A", votes: 2 },
          { id: 2, text: "Option B", votes: 1 },
          { id: 3, text: "Option C", votes: 0 },
        ]
      }
    }),
  ]
};

// Mock chat list
export const mockChats: any[] = [
  {
    id: 101,
    chat_type: 'direct',
    group_image: null,
    group_name: null,
    last_message: mockMessages[101][mockMessages[101].length - 1],
    other_user: mockUsers[1], // Alice
    unread_count: 2,
    member_count: 2,
    is_admin: false,
    pinned_message: null,
  },
  {
    id: 102,
    chat_type: 'direct',
    group_image: null,
    group_name: null,
    last_message: mockMessages[102][mockMessages[102].length - 1],
    other_user: mockUsers[2], // Bob
    unread_count: 0,
    member_count: 2,
    is_admin: false,
    pinned_message: null,
  },
  {
    id: 201,
    chat_type: 'group',
    group_image: 'https://i.pravatar.cc/150?u=group1',
    group_name: 'Project Team',
    last_message: mockMessages[201][mockMessages[201].length - 1],
    other_user: null,
    unread_count: 5,
    member_count: 4,
    is_admin: true,
    pinned_message: {
        id: 1,
        content: "Hey team, what's the status on the new feature?",
        sender: "Charlie",
        sender_profile_picture: 'https://i.pravatar.cc/150?u=charlie',
        sender_bio: `Bio of Charlie`,
        timestamp: new Date(now.getTime() - 60000 * 30).toISOString(),
        isOwn: false,
        is_edited: false,
        is_deleted: false,
        read_by: [],
    },
  },
  {
    id: 103,
    chat_type: 'direct',
    group_image: null,
    group_name: null,
    last_message: {
      content: 'See you tomorrow!',
      id: 1,
      sender: { id: 4, username: 'Charlie' },
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    },
    other_user: mockUsers[3], // Charlie
    unread_count: 0,
    member_count: 2,
    is_admin: false,
    pinned_message: null,
  },
  {
    id: 104,
    chat_type: 'direct',
    group_image: null,
    group_name: null,
    last_message: {
      content: 'Can you call me back?',
      id: 1,
      sender: { id: 5, username: 'Diana' },
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    },
    other_user: mockUsers[4], // Diana
    unread_count: 1,
    member_count: 2,
    is_admin: false,
    pinned_message: null,
  },
];

// Mock Chat Details
export const mockChatDetails: { [chatId: number]: ChatDetails } = {
  101: {
    id: 101,
    participants: [mockUsers[0], mockUsers[1]],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_type: 'direct',
    group_name: '',
    group_admin: [],
    group_image: '',
    max_participants: 2,
    description: '',
    other_user: mockUsers[1],
  },
  102: {
    id: 102,
    participants: [mockUsers[0], mockUsers[2]],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_type: 'direct',
    group_name: '',
    group_admin: [],
    group_image: '',
    max_participants: 2,
    description: '',
    other_user: mockUsers[2],
  },
  201: {
    id: 201,
    participants: [mockUsers[0], mockUsers[3], mockUsers[4], mockUsers[5]],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_type: 'group',
    group_name: 'Project Team',
    group_admin: [mockUsers[0]],
    group_image: 'https://i.pravatar.cc/150?u=group1',
    max_participants: 10,
    description: 'A group for the project team members.',
  },
};
