'use strict';

const { Router } = require('express');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const { search } = require('../controllers/search.controller');

const router = Router();

// Search is public — optionally authenticated to personalise results
router.get('/', optionalAuthenticate, search);

module.exports = router;
