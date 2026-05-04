const hasRealMongoUri = () => {
  const mongoUri = process.env.MONGO_URI;
  return Boolean(mongoUri && mongoUri !== 'your_mongodb_connection_string');
};

const isMockDbEnabled = () => process.env.USE_MOCK_DB === 'true' || !hasRealMongoUri();

const mockUsers = [
  {
    _id: 'mock-user-1',
    username: 'demo_user',
    avatar: '',
    role: 'user'
  }
];

const mockCategories = [
  {
    _id: 'mock-category-1',
    name: 'General',
    slug: 'general',
    description: 'General forum discussion',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  },
  {
    _id: 'mock-category-2',
    name: 'Help',
    slug: 'help',
    description: 'Questions and support',
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z')
  }
];

const mockPosts = [
  {
    _id: 'mock-post-1',
    title: 'Welcome to the forum',
    content: 'This mock post is available without a MongoDB connection.',
    author: mockUsers[0],
    category: mockCategories[0],
    tags: ['welcome', 'mock'],
    likes: [],
    likeCount: 0,
    createdAt: new Date('2026-01-03T00:00:00.000Z'),
    updatedAt: new Date('2026-01-03T00:00:00.000Z')
  },
  {
    _id: 'mock-post-2',
    title: 'How to test the API locally',
    content: 'Use USE_MOCK_DB=true while MongoDB is not configured.',
    author: mockUsers[0],
    category: mockCategories[1],
    tags: ['development', 'api'],
    likes: ['mock-user-1'],
    likeCount: 0,
    createdAt: new Date('2026-01-04T00:00:00.000Z'),
    updatedAt: new Date('2026-01-04T00:00:00.000Z')
  }
];

const mockComments = [
  {
    _id: 'mock-comment-1',
    content: 'This is a mock comment.',
    author: mockUsers[0],
    post: 'mock-post-1',
    parent: null,
    likes: [],
    likeCount: 0,
    createdAt: new Date('2026-01-05T00:00:00.000Z'),
    updatedAt: new Date('2026-01-05T00:00:00.000Z')
  }
];

module.exports = {
  hasRealMongoUri,
  isMockDbEnabled,
  mockUsers,
  mockCategories,
  mockPosts,
  mockComments
};
