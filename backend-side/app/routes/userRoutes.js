const express = require('express');
const router = express.Router();
const { updateEmailUser, deleteAccount } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/testMiddleware');

router.put('/change-email', authenticateToken, updateEmailUser);
router.delete('/delete-account', authenticateToken, deleteAccount);

module.exports = router;