const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/userMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: Unique user ID
 *         displayName:
 *           type: string
 *           description: Display name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         emailVerified:
 *           type: boolean
 *           description: Indicates if the email is verified
 *         photoURL:
 *           type: string
 *           nullable: true
 *           description: URL for user's photo
 *         phoneNumber:
 *           type: string
 *           nullable: true
 *           description: Phone number of the user
 *         disabled:
 *           type: boolean
 *           description: Indicates if the user is disabled
 *         metadata:
 *           type: object
 *           properties:
 *             creationTime:
 *               type: string
 *               format: date-time
 *               description: Creation time of the user
 *             lastSignInTime:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Last sign-in time of the user
 *             lastRefreshTime:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Last refresh time
 *         providerData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Unique identifier
 *               displayName:
 *                 type: string
 *                 description: Display name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               photoURL:
 *                 type: string
 *                 nullable: true
 *                 description: URL for user's photo
 *               providerId:
 *                 type: string
 *                 description: Provider ID
 *               phoneNumber:
 *                 type: string
 *                 nullable: true
 *                 description: Phone number
 *         passwordHash:
 *           type: string
 *           description: Hashed password
 *         passwordSalt:
 *           type: string
 *           description: Salt used in password hashing
 *         customClaims:
 *           type: object
 *           properties:
 *             verificationCode:
 *               type: string
 *               description: Verification code
 *             resetCode:
 *               type: string
 *               nullable: true
 *               description: Reset code
 *             resetCodeExpiration:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Expiration time for reset code
 *         tokensValidAfterTime:
 *           type: string
 *           format: date-time
 *           description: Time when tokens become valid
 *         tenantId:
 *           type: string
 *           nullable: true
 *           description: Tenant ID
 *         refreshToken:
 *           type: string
 *           nullable: true
 *           description: Refresh token
 *         userPreferences:
 *           type: object
 *           nullable: true
 *           description: User preferences
 *           properties:
 *             age:
 *               type: integer
 *               nullable: true
 *               description: Age of the user
 *             height:
 *               type: integer
 *               nullable: true
 *               description: Height of the user
 *             weight:
 *               type: integer
 *               nullable: true
 *               description: Weight of the user
 *             gender:
 *               type: string
 *               nullable: true
 *               description: Gender of the user, 'Female' or 'Male'
 *             activity:
 *               type: string
 *               nullable: true
 *               description: Activity level of the user, 'Little/no exercise', 'Light exercise', 'Moderate exercise (3-5 days/wk)', 'Very active (6-7 days/wk)', 'Extra active (very active & physical job)'
 *             weight_loss:
 *               type: boolean
 *               nullable: true
 *               description: Category of weight loss preferred by the user, 'Maintain weight','Mild weight loss','Weight loss','Extreme weight loss'
 *             number_of_meals:
 *               type: integer
 *               nullable: true
 *               description: Number of meals per day for the user, 1 (untuk real time craving), 3, 4, or 5 (untuk meal plan)
 *             halal:
 *               type: boolean
 *               nullable: true
 *               description: Indicates if the user prefers halal food
 *             allergen:
 */


/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operations related to user
 * 
* /user/change-password:
*   put:
*     summary: Change user password
*     tags: [User]
*     description: Change the user's password after verifying the current password
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               currentPassword:
*                 type: string
*               newPassword:
*                 type: string
*             required:
*               - currentPassword
*               - newPassword
*     responses:
*       '200':
*         description: Password changed successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                 accessToken:
*                   type: string
*       '401':
*         description: Current password is incorrect
*         content:
*           application/json:
*             example:
*               error: Current password is incorrect.
*       '404':
*         description: User not found
*         content:
*           application/json:
*             example:
*               error: User not found.
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

* /user/change-email:
*   put:
*     summary: Update user email
*     tags: [User]
*     description: Update the user's email address and trigger verification
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*             required:
*               - email
*     responses:
*       '200':
*         description: Email changed successfully
*         content:
*           application/json:
*             example:
*               message: Email verification and verification code updated successfully
*       '400':
*         description: Email already registered
*         content:
*           application/json:
*             example:
*               error: Email already registered
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

* /user/delete-account:
*   delete:
*     summary: Delete user account
*     tags: [User]
*     description: Delete the user's account after verifying the password
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               password:
*                 type: string
*             required:
*               - password
*     responses:
*       '200':
*         description: User account deleted successfully.
*         content:
*           application/json:
*             example:
*               message: User account deleted successfully.
*       '404':
*         description: User not found.
*         content:
*           application/json:
*             example:
*               error: User not found.
*       '401':
*         description: Invalid Password
*         content:
*           application/json:
*             example:
*               error: Invalid password. Account deletion failed.
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

* /user/change-name:
*   put:
*     summary: Change user display name
*     tags: [User]
*     description: Change the user's display name
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*             required:
*               - name
*     responses:
*       '200':
*         description: Display name changed successfully.
*         content:
*           application/json:
*             example:
*               message: Display name changed successfully.
*       '400':
*         description: Invalid name
*         content:
*           application/json:
*             example:
*               error: Name can not be empty.
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

* /user/change-preferences:
*   put:
*     summary: Update user preferences
*     tags: [User]
*     description: Update the user's health preferences
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               preferences:
*                 type: object
*                 properties:
*                   age:
*                     type: integer
*                   height:
*                     type: integer
*                   weight:
*                     type: integer
*                   gender:
*                     type: string
*                     enum:
*                       - Male
*                       - Female
*                   activity:
*                     type: string
*                     enum:
*                       - Little/no exercise
*                       - Light exercise
*                       - Moderate exercise (3-5 days/wk)
*                       - Very active (6-7 days/wk)
*                       - Extra active (very active & physical job)
*                   weight_loss:
*                     type: string
*                     enum:
*                       - Maintain weight
*                       - Mild weight loss
*                       - Weight loss
*                       - Extreme weight loss
*                   number_of_meals:
*                     type: integer
*                     enum:
*                       - 3
*                       - 4
*                       - 5
*                   halal:
*                     type: boolean
*                   allergen:
*                     type: array
*                     items:
*                       type: string
*                   disease:
*                     type: string
*                     enum:
*                       - heart_disease
*                       - hypertension
*                       - kidney_disease
*                       - diabetes
*                       - obesity
*                 required:
*                   - age
*                   - height
*                   - weight
*                   - gender
*                   - activity
*                   - weight_loss
*                   - number_of_meals
*                   - halal
*                   - allergen
*                   - disease
*     responses:
*       '200':
*         description: changed successfully.
*         content:
*           application/json:
*             example:
*               message: User health preferences updated successfully
*       '400':
*         description: Invalid preferences provided
*         content:
*           application/json:
*             example:
*               error: string
*       '404':
*         description: User not found
*         content:
*           application/json:
*             example:
*               error: User not found
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

* /user/user-data:
*   post:
*     summary: Get user data
*     tags: [User]
*     description: Retrieve user data based on the authenticated user
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: changed successfully.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 userData: string
*       '404':
*         description: User not found
*         content:
*           application/json:
*             example:
*               error: User not found
*       '500':
*         description: Internal server error
*         content:
*           application/json:
*             example:
*               error: Internal server error.

 */


router.put('/change-password', authenticateToken, userController.changePassword);
router.put('/change-email', authenticateToken, userController.updateEmailUser);
router.delete('/delete-account', authenticateToken, userController.deleteAccount);
router.put('/change-name', authenticateToken, userController.changeDisplayName);
router.put('/change-preferences', authenticateToken, userController.updateUserPreferences);
router.post('/user-data', authenticateToken, userController.getUserData)

module.exports = router;