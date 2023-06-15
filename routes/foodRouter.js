const express = require('express');
const router = express.Router();
const { getFoods, getFoodById, createFood, updateFood, deleteFood } = require('../controller/foodController');

// CRUD
router.get("/", getFoods);
router.get("/:id", getFoodById);
router.post("/",createFood);
router.put("/:id",updateFood);
router.delete("/:id",deleteFood);


module.exports = router;
