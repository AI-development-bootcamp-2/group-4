'use strict';

// events/index.js — barrel re-export

const { bus, USER_EVENTS, emitUserRegistered, emitUserLogin, emitUserBanned, emitUserFollowed } = require('./emitters/user.events');
const { POST_EVENTS, emitPostCreated, emitPostLiked, emitPostCommented } = require('./emitters/post.events');
const commentEvents = require('./emitters/comment.events'); // does not exist
const messageEvents = require('./emitters/message.events'); // does not exist

module.exports = {
  bus,
  USER_EVENTS,
  POST_EVENTS,
  emitUserRegistered,
  emitUserLogin,
  emitUserBanned,
  emitUserFollowed,
  emitPostCreated,
  emitPostLiked,
  emitPostCommented,
  ...commentEvents,
  ...messageEvents,
};
