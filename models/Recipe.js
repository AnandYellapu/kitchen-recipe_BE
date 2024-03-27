

// models/Recipe.js

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: String, // Changed to String type to accommodate non-numeric formats
        required: false // Make the quantity field optional
    },
    quantityDetails: { // New field to handle fractional quantities explicitly
        whole: {
            type: Number,
            default: 0
        },
        numerator: {
            type: Number,
            default: 0
        },
        denominator: {
            type: Number,
            default: 1
        }
    },
    units: {
        type: String,
        required: false // Make the units field optional
    }
});

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    process: {
        type: String,
        required: true
    },
    ingredients: {
        type: [ingredientSchema], // Embedding the Ingredient schema as an array
        required: true
    },
    isFavorite: {
        type: Boolean,
        default: false // Default value is false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;