const express = require('express');
const router = express.Router();
const recipeController = require('../controller/recipeController');


// Route to create a new recipe with image upload
router.post('/create', recipeController.createRecipe);

// Route to get all recipes
router.get('/all', recipeController.getRecipes);

// Route to get a single recipe by ID
router.get('/get/:id', recipeController.getRecipeById);

// Route to update a recipe by ID
router.put('/update/:id', recipeController.updateRecipeById);

// Route to delete a recipe by ID
router.delete('/delete/:id', recipeController.deleteRecipeById);

// Route to toggle the favorite status of a recipe by ID
router.post('/favorite/:id', recipeController.toggleFavorite);

module.exports = router;
