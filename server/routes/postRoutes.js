const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} = require('../controllers/postController');
const {
  getCommentsByPost,
  createComment
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.post('/', authMiddleware, createPost);

router.get('/:id/comments', getCommentsByPost);
router.post('/:postId/comments', authMiddleware, createComment);

router.post('/:id/like', authMiddleware, likePost);
router.delete('/:id/like', authMiddleware, unlikePost);

router.get('/:id', getPostById);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
