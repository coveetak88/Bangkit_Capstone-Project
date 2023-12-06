const express = require('express');
const router = express.Router();
const { getUser } = require('../controllers/testController');
const { authenticateToken } = require('../middleware/testMiddleware');

router.get('/user', authenticateToken, getUser);

module.exports = router;