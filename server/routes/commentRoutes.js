const express = require('express');
const {
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/:id/like', authMiddleware, likeComment);
router.delete('/:id/like', authMiddleware, unlikeComment);

module.exports = router;
