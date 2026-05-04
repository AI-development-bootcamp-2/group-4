'use strict';

const searchService = require('../../src/services/search.service');
const searchEngine  = require('../../src/lib/searchEngine');

jest.mock('../../src/lib/searchEngine');

describe('search.service', () => {
  describe('globalSearch()', () => {
    it('returns combined results', async () => {
      searchEngine.searchCollections = jest.fn().mockResolvedValue({
        users: [], posts: [], comments: [],
      });

      const result = await searchService.globalSearch({ q: 'hello', type: 'all' });

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('total');
    });

    it('returns only users when type=users', async () => {
      searchEngine.searchCollections = jest.fn().mockResolvedValue({
        users: [{ username: 'alice' }], posts: [], comments: [],
      });

      const result = await searchService.globalSearch({ q: 'ali', type: 'users' });

      expect(result.users).toHaveLength(1);
      expect(result.posts).toHaveLength(0);
    });
  });
});
