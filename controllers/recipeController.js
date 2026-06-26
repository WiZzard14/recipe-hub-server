import Recipe from '../models/Recipe.js';

export const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category;

    let filter = {};
    if (category && category !== "All") {
        filter = { category: category };
    }

    const skip = (page - 1) * limit;

    const recipes = await Recipe.find(filter)
                          .sort({ createdAt: -1 })
                          .skip(skip)
                          .limit(limit);

    const totalRecipes = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(totalRecipes / limit);

    res.status(200).json({ recipes, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ message: "Server Error to get recipes" });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};