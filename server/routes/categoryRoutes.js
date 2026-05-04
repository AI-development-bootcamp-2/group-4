const express = require('express');
const {
  getCategories,
  createCategory,
  getPopularTags
} = require('../controllers/categoryController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', authMiddleware, adminOnly, createCategory);
router.get('/tags/popular', getPopularTags);

module.exports = router;
