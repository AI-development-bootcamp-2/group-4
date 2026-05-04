const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { isMockDbEnabled, mockComments, mockPosts } = require('../config/mockDb');
const { isOwnerOrAdmin } = require('../utils/auth');

const populateComment = (query) =>
  query
    .populate('author', 'username email avatar bio role password')
    .populate('post', 'title')
    .populate('parent', 'content author')
    .populate('likes', 'username email avatar role');

const collectCommentTreeIds = async (rootId) => {
  const ids = [rootId];
  let frontier = [rootId];

  while (frontier.length > 0) {
    const children = await Comment.find({ parent: { $in: frontier } }).select('_id');
    frontier = children.map((comment) => comment._id);
    ids.push(...frontier);
  }

  return ids;
};

const getCommentsByPost = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.json(mockComments.filter((comment) => comment.post === post._id));
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await populateComment(
      Comment.find({ post: post._id }).sort({ createdAt: 1 })
    );

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content, parent } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (isMockDbEnabled()) {
      const post = mockPosts.find((item) => item._id === req.params.postId);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (parent) {
        const parentComment = mockComments.find(
          (comment) => comment._id === parent && comment.post === post._id
        );

        if (!parentComment) {
          return res.status(400).json({ message: 'Parent comment must belong to this post' });
        }
      }

      const comment = {
        _id: `mock-comment-${Date.now()}`,
        content,
        author: {
          _id: req.user._id,
          username: req.user.username,
          avatar: req.user.avatar || '',
          role: req.user.role
        },
        post: post._id,
        parent: parent || null,
        likes: [],
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockComments.push(comment);
      return res.status(201).json(comment);
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parent) {
      const parentComment = await Comment.findOne({ _id: parent, post: post._id });
      if (!parentComment) {
        return res.status(400).json({ message: 'Parent comment must belong to this post' });
      }
    }

    const comment = await Comment.create({
      content,
      parent: parent || null,
      post: post._id,
      author: req.user._id
    });

    const populatedComment = await populateComment(Comment.findById(comment._id));
    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const comment = mockComments.find((item) => item._id === req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (!isOwnerOrAdmin(comment.author._id, req.user)) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
      }

      if (!req.body.content || !req.body.content.trim()) {
        return res.status(400).json({ message: 'Content is required' });
      }

      comment.content = req.body.content;
      comment.updatedAt = new Date();

      return res.json(comment);
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!isOwnerOrAdmin(comment.author, req.user)) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    comment.content = req.body.content;
    await comment.save();

    const populatedComment = await populateComment(Comment.findById(comment._id));
    res.json(populatedComment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const comment = mockComments.find((item) => item._id === req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (!isOwnerOrAdmin(comment.author._id, req.user)) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      for (let index = mockComments.length - 1; index >= 0; index -= 1) {
        if (mockComments[index]._id === comment._id || mockComments[index].parent === comment._id) {
          mockComments.splice(index, 1);
        }
      }

      return res.json({ message: 'Comment deleted' });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!isOwnerOrAdmin(comment.author, req.user)) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    const idsToDelete = await collectCommentTreeIds(comment._id);
    await Comment.deleteMany({ _id: { $in: idsToDelete } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

const likeComment = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const comment = mockComments.find((item) => item._id === req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const userId = req.user._id.toString();
      if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
      }
      comment.likeCount = comment.likes.length;

      return res.json(comment);
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { likes: req.user._id } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const populatedComment = await populateComment(Comment.findById(comment._id));
    res.json(populatedComment);
  } catch (error) {
    next(error);
  }
};

const unlikeComment = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const comment = mockComments.find((item) => item._id === req.params.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const userId = req.user._id.toString();
      comment.likes = comment.likes.filter((like) => like !== userId);
      comment.likeCount = comment.likes.length;

      return res.json(comment);
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const populatedComment = await populateComment(Comment.findById(comment._id));
    res.json(populatedComment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment
};
