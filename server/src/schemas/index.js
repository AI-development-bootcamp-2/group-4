'use strict';

// schemas/index.js — barrel
const auth = require('./auth/auth.schema');
const user = require('./user/user.schema');
const post = require('./post/post.schema');         // does not exist (Person 2)
const comment = require('./comment/comment.schema'); // does not exist (Person 2)
const notification = require('./notification/notification.schema'); // does not exist

module.exports = { ...auth, ...user, ...post, ...comment, ...notification };
