// controllers/recipeController.js

const Recipe  = require('../models/Recipe');

// Controller function to create a new recipe
const createRecipe = async (req, res) => {
    try {
        const { title, type, description, imageUrl, process, ingredients } = req.body;

        // Create a new recipe
        const recipe = new Recipe({
            title,
            type,
            description,
            imageUrl,
            process,
            ingredients
        });

        // Save the recipe to the database
        await recipe.save();

        res.status(201).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller function to get all recipes
const getRecipes = async (req, res) => {
    try {
        // Fetch all recipes from the database
        const recipes = await Recipe.find();

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller function to get a single recipe by ID
const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find recipe by ID
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller function to update a recipe by ID
const updateRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, description, imageUrl, process, ingredients } = req.body;

        // Find recipe by ID and update its fields
        const recipe = await Recipe.findByIdAndUpdate(id, {
            title,
            type,
            description,
            imageUrl,
            process,
            ingredients
        }, { new: true });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller function to delete a recipe by ID
const deleteRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find recipe by ID and delete it
        const recipe = await Recipe.findByIdAndDelete(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// Controller function to toggle favorite status of a recipe by ID
const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        // Find recipe by ID
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        // Toggle favorite status
        recipe.isFavorite = !recipe.isFavorite;

        // Save the updated recipe
        await recipe.save();

        res.status(200).json({ isFavorite: recipe.isFavorite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = { 
    createRecipe, 
    getRecipes, 
    getRecipeById, 
    updateRecipeById, 
    deleteRecipeById,
    toggleFavorite,
};
