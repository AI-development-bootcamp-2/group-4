const Category = require('../models/Category');
const Post = require('../models/Post');
const { isMockDbEnabled, mockCategories, mockPosts } = require('../config/mockDb');
const slugify = require('../utils/slugify');

const getCategories = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      return res.json(mockCategories);
    }

    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!slug) {
      return res.status(400).json({ message: 'Category name must include letters or numbers' });
    }

    if (isMockDbEnabled()) {
      const categoryExists = mockCategories.some((category) => category.slug === slug);

      if (categoryExists) {
        return res.status(409).json({ message: 'Category already exists' });
      }

      const category = {
        _id: `mock-category-${Date.now()}`,
        name,
        slug,
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategories.push(category);
      return res.status(201).json(category);
    }

    const category = await Category.create({
      name,
      slug,
      description: description || ''
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const getPopularTags = async (req, res, next) => {
  try {
    if (isMockDbEnabled()) {
      const tagCounts = mockPosts.reduce((counts, post) => {
        post.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
        return counts;
      }, {});

      const tags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((first, second) => second.count - first.count || first.tag.localeCompare(second.tag))
        .slice(0, 25);

      return res.json(tags);
    }

    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 25 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);

    res.json(tags);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  getPopularTags
};
