const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const { authenticateToken } = require("../middleware/userMiddleware");

/**
 * @swagger
 * tags:
 *   name: Food
 *   description: Operations related to food recommendation
 * 
 * /food/get-meal-plan:
 *   get:
 *     summary: User get meal plan
 *     tags: [Food]
 *     description: Get user meal plan in a day
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *          type: object
 *          properties:
 *            mealPlan:
 *              type: array
 *              items:
 *                type: object
 *                # Define the structure of the meal plan object here
 *     securityDefinitions:
 *       BearerAuth:
 *         type: apiKey
 *         name: Authorization
 *         in: header
 * /food/real-time-cravings:
 *   get:
 *     summary: User get food recommendation based on their real time craving
 *     tags: [Food]
 *     description: Get user food recommendation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keywords:
 *                 type: array
 *             required:
 *               - keywords
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *          type: object
 *          properties:
 *            mealPlan:
 *              type: array
 *              items:
 *                type: object
 *                # Define the structure of the meal plan object here
 *     securityDefinitions:
 *       BearerAuth:
 *         type: apiKey
 *         name: Authorization
 *         in: header
 */

router.get("/menu", foodController.getFoodsByKeyword);
router.get("/get-meal-plan", authenticateToken, foodController.getMealPlan);
router.get("/real-time-cravings", authenticateToken, foodController.realTimeCravings);

module.exports = router;
