'use strict';

jest.mock('../../src/models/User');
jest.mock('../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const User = require('../../src/models/User');
const { mockUser } = require('../helpers/fixtures');

describe('user controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: { id: mockUser._id, role: 'user' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated user list', async () => {
      User.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });
      User.countDocuments = jest.fn().mockResolvedValue(1);

      const { getUsers } = require('../../src/controllers/user.controller');
      await getUsers(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getUserById', () => {
    it('should return 404 when user does not exist', async () => {
      req.params.id = 'nonexistentid';
      User.findById = jest.fn().mockResolvedValue(null);

      const { getUserById } = require('../../src/controllers/user.controller');
      await getUserById(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return user profile', async () => {
      req.params.id = mockUser._id;
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const { getUserById } = require('../../src/controllers/user.controller');
      await getUserById(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteUser', () => {
    it('should return 200 on successful delete', async () => {
      req.params.id = mockUser._id;
      User.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);

      const { deleteUser } = require('../../src/controllers/user.controller');
      await deleteUser(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      req.params.id = '507f1f77bcf86cd799439099';
      const targetUser = { ...mockUser, _id: req.params.id, followers: [], save: jest.fn() };
      const currentUser = { ...mockUser, following: [], save: jest.fn() };

      User.findById = jest.fn()
        .mockResolvedValueOnce(currentUser)
        .mockResolvedValueOnce(targetUser);

      const { followUser } = require('../../src/controllers/user.controller');
      await followUser(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
