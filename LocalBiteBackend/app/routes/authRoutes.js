const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operations related to user authentication
 * 
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User created successfully
 *               userId: string
 *       400:
 *         description: Email already registered or invalid data
 *         content:
 *           application/json:
 *             example:
 *               error:  Email already registered or invalid data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/verify:
 *   post:
 *     summary: Verify user email
 *     tags: [Auth]
 *     description: Verify user email using a verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email verified successfully
 *       400:
 *         description: Invalid verification code
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid verification code
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate user and generate access tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               message: Login successful
 *               accessToken: string
 *               refreshToken: string
 *       401:
 *         description: Invalid credentials or email not verified
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid credentials or email not verified
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: Generate a new access token using a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             example:
 *               accessToken: string
 *       403:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     description: Invalidate a refresh token to log the user out
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               message: Logout successful
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid or expired token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Auth]
 *     description: Resend the verification code to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code resent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Verification code resent successfully
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             example:
 *               error: Email not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     description: Send a reset link to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset link sent successfully
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             example:
 *               error: Email not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 * 
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     description: Reset user password using a reset code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               resetCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset successfully
 *       401:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid or expired reset token
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             example:
 *               error: Email not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal server error
 */


router.post('/login', authController.loginUser);
router.post('/verify', authController.verifyEmail);
router.post('/signup', authController.signupUser);
router.delete('/logout', authController.logoutUser);
router.post('/token', authController.refreshToken);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
