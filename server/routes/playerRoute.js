const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/playerController');

// Define routes
router.get('/', getMatches);

module.exports = router;
