'use strict';

const searchService = require('../../src/services/search.service');
const searchEngine  = require('../../src/lib/searchEngine');

jest.mock('../../src/lib/searchEngine');

describe('search.service', () => {
  describe('search()', () => {
    it('returns combined results', async () => {
      searchEngine.searchUsers    = jest.fn().mockResolvedValue([]);
      searchEngine.searchPosts    = jest.fn().mockResolvedValue([]);
      searchEngine.searchComments = jest.fn().mockResolvedValue([]);

      const result = await searchService.search({ term: 'hello', type: 'all', limit: 5 });

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('total');
    });

    it('returns only users when type=users', async () => {
      searchEngine.searchUsers = jest.fn().mockResolvedValue([{ username: 'alice' }]);

      const result = await searchService.search({ term: 'ali', type: 'users', limit: 5 });

      expect(result.users).toHaveLength(1);
      expect(result.posts).toHaveLength(0);
    });
  });
});
