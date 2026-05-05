'use strict';

/**
 * @module transformers/search.transformer
 * Normalises cross-collection search results into a unified shape.
 */

function transformUsers(users = []) {
  return users.map((u) => ({
    id:       u._id,
    type:     'user',
    username: u.username,
    avatar:   u.avatar,
    bio:      u.bio,
  }));
}

function transformPosts(posts = []) {
  return posts.map((p) => ({
    id:       p._id,
    type:     'post',
    title:    p.title,
    excerpt:  p.content ? p.content.substring(0, 200) : '',
    author:   p.author,
    category: p.category,
    tags:     p.tags,
  }));
}

function transformComments(comments = []) {
  return comments.map((c) => ({
    id:      c._id,
    type:    'comment',
    excerpt: c.content ? c.content.substring(0, 200) : '',
    author:  c.author,
    post:    c.post,
  }));
}

function transformResults({ users, posts, comments } = {}) {
  return {
    users:    transformUsers(users),
    posts:    transformPosts(posts),
    comments: transformComments(comments),
  };
}

module.exports = { transformUsers, transformPosts, transformComments, transformResults };
