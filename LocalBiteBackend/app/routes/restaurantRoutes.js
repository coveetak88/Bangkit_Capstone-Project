const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Operations related to restaurant
 * 
 * /maps/nearest-restaurant:
 *   post:
 *     summary: Get restaurant
 *     tags: [Restaurant]
 *     description: Get nearest hidden gem restaurant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               menu:
 *                 type: string
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *               radius:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *          type: object
 *          properties:
 *            restaurant:
 *              type: array
 *              items:
 *                type: object
 *                # Define the structure of the meal plan object here
 */

router.post('/nearest-restaurant', restaurantController.findNearestRestaurant);

module.exports = router;
