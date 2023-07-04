const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        foodProcess: {
            type: [String],
            required: true,
        },
        ingredients: {
            type: [
              {
                item: {
                  type: String,
                  required: true
                },
                amount: {
                  type: [Number, String],
                  required: true
                },
                unit: {
                  type: String,
                  required: true
                }
              }
            ],
            required: true
        }
    });

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
