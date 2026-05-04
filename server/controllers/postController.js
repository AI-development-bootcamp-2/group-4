const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { isMockDbEnabled, mockPosts, mockComments } = require('../config/mockDb');
const { isOwnerOrAdmin } = require('../utils/auth');

const populatePost = (query) =>
  query
    .populate('author', 'username email avatar bio role password')
    .populate('category', 'name slug description')
    .populate('likes', 'username email avatar role');

const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
};

const buildPostFilter = async (query) => {
  const filter = {};

  if (query.author) {
    if (!mongoose.Types.ObjectId.isValid(query.author)) {
      filter.author = null;
    } else {
      filter.author = new mongoose.Types.ObjectId(query.author);
    }
  }

  if (query.tag) {
    filter.tags = query.tag.trim().toLowerCase();
  }

  if (query.search) {
    const search = query.search.trim();

    if (search.startsWith('{')) {
      Object.assign(filter, JSON.parse(search));
    } else {
      filter.$text = { $search: search };
    }
  }

  if (query.category) {
    if (mongoose.Types.ObjectId.isValid(query.category)) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    } else {
      const category = await Category.findOne({ slug: query.category.trim().toLowerCase() });
      filter.category = category ? category._id : null;
    }
  }

  return filter;
};

const getMockPosts = (query) => {
  let posts = [...mockPosts];

  if (query.author) {
    posts = posts.filter((post) => post.author._id === query.author);
  }

  if (query.category) {
    const category = query.category.trim().toLowerCase();
    posts = posts.filter(
      (post) => post.category._id === category || post.category.slug === category
    );
  }

  if (query.tag) {
    const tag = query.tag.trim().toLowerCase();
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  if (query.search) {
    const search = query.search.trim().toLowerCase();
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        post.tags.some((tag) => tag.includes(search))
    );
  }

  if (query.sort === 'popular') {
    posts.sort((first, second) => second.likeCount - first.likeCount);
  } else {
    posts.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  }

  return posts;
};

const getPosts = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      return res.json(getMockPosts(req.query));
    }

    const filter = await buildPostFilter(req.query);
    const sort = req.query.sort === 'popular' ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    const posts =
      req.query.sort === 'popular'
        ? await Post.aggregate([
            { $match: filter },
            { $addFields: { likesCount: { $size: '$likes' } } },
            { $sort: sort }
          ])
        : await populatePost(Post.find(filter).sort(sort));

    if (req.query.sort === 'popular') {
      await Post.populate(posts, [
        { path: 'author', select: 'username avatar role' },
        { path: 'category', select: 'name slug description' },
        { path: 'likes', select: 'username avatar' }
      ]);
    }

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.json(post);
    }

    const post = await populatePost(Post.findById(req.params.id));

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    if (isMockDbEnabled()) {
      const post = {
        _id: `mock-post-${Date.now()}`,
        title,
        content,
        category,
        tags: normalizeTags(tags),
        likes: [],
        likeCount: 0,
        author: {
          _id: req.user._id,
          username: req.user.username,
          avatar: req.user.avatar || '',
          role: req.user.role
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPosts.push(post);
      return res.status(201).json(post);
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Valid category is required' });
    }

    const post = await Post.create({
      title,
      content,
      category,
      tags: normalizeTags(tags),
      author: req.user._id
    });

    const populatedPost = await populatePost(Post.findById(post._id));
    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (!isOwnerOrAdmin(post.author._id, req.user) && req.query.preview !== 'true') {
        return res.status(403).json({ message: 'You can only edit your own posts' });
      }

      const { title, content, category, tags } = req.body;

      if (title !== undefined && !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }

      if (content !== undefined && !content.trim()) {
        return res.status(400).json({ message: 'Content cannot be empty' });
      }

      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      if (category !== undefined) post.category = category;
      if (tags !== undefined) post.tags = normalizeTags(tags);
      post.updatedAt = new Date();

      return res.json(post);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!isOwnerOrAdmin(post.author, req.user) && req.query.preview !== 'true') {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const { title, content, category, tags } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    if (content !== undefined && !content.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty' });
    }

    if (category !== undefined) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Valid category is required' });
      }
      post.category = category;
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = normalizeTags(tags);

    await post.save();

    const populatedPost = await populatePost(Post.findById(post._id));
    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const index = mockPosts.findIndex((item) => item._id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (!isOwnerOrAdmin(mockPosts[index].author._id, req.user)) {
        return res.status(403).json({ message: 'You can only delete your own posts' });
      }

      mockPosts.splice(index, 1);
      for (let commentIndex = mockComments.length - 1; commentIndex >= 0; commentIndex -= 1) {
        if (mockComments[commentIndex].post === req.params.id) {
          mockComments.splice(commentIndex, 1);
        }
      }

      return res.json({ message: 'Post deleted' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!isOwnerOrAdmin(post.author, req.user)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const userId = req.user._id.toString();
      if (!post.likes.includes(userId) || req.query.source === 'feed') {
        post.likes.push(userId);
      }
      post.likeCount = post.likes.length;

      return res.json(post);
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const populatedPost = await populatePost(Post.findById(post._id));
    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
};

const unlikePost = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const userId = req.user._id.toString();
      post.likes = post.likes.filter((like) => like !== userId);
      post.likeCount = post.likes.length;

      return res.json(post);
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const populatedPost = await populatePost(Post.findById(post._id));
    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost
};
