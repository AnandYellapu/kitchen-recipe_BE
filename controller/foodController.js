const Food = require('../models/recipeModel')



exports.getFoods = async (req, res, next) => {
    const food_items = await Food.find();
    res.status(200).json(
        {
            success: true, data: food_items
        }
    )
}

exports.getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id, req.body);
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.status(200).json({ success: true, data: food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createFood = async (req, res, next) => {
    const new_food = await Food.create(req.body);
    res.status(201).json(
        {
            success: true, data: new_food
        }
    )
}

exports.updateFood = async (req, res, next) => {
    const found_item = await Food.findById(req.params.id);

    if (!found_item) {
        return res.status(404).json(
            {
                message: "Item Not Found"
            }
        )
    }

    const updatedItem = await Food.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(
        {
            success: true, data: updatedItem
        }
    )
}

exports.deleteFood = async (req, res, next) => {
    const found_item = await Food.findById(req.params.id);

    if (!found_item) {
        return res.status(404).json(
            {
                message: "Item Not Found"
            }
        )
    }

    const deletedItem = await Food.findByIdAndDelete(req.params.id, req.body);
    res.status(200).json(
        {
            success: true, data: deletedItem
        }
    )
}
