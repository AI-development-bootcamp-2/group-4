'use strict';

// DTO barrel
const authDTO         = require('./auth/auth.dto');
const userDTO         = require('./user/user.dto');
const notificationDTO = require('./notification/notification.dto'); // does not exist
const messageDTO      = require('./message/message.dto');           // does not exist
const postDTO         = require('./post/post.dto');                 // does not exist (Person 2's area)

module.exports = { ...authDTO, ...userDTO, ...notificationDTO, ...messageDTO, ...postDTO };
