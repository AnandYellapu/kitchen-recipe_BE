const express = require('express');
const router = express.Router();
const foodController = require('../controller/foodController');
const verifyToken = require('../middleware/auth');

// CRUD
router.get("/", verifyToken, foodController.getFoods);
router.get("/:id", foodController.getFoodById);
router.post("/", foodController.createFood);
// router.put("/:id", foodController.updateFood);
// router.delete("/:id", foodController.deleteFood);
router.put("/:id",  foodController.updateFood);
router.delete("/:id", foodController.deleteFood);
router.get("/dashboard")

module.exports = router;