const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginUser);
router.post('/verify', authController.verifyEmail);
router.post('/signup', authController.signupUser);
router.delete('/logout', authController.logoutUser);
router.post('/token', authController.refreshToken);

module.exports = router;
