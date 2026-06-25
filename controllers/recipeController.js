import Recipe from '../models/Recipe.js';

export const addRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRecipes = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let query = {};

    if (category) {
      const categoriesArray = category.split(','); 
      query.category = { $in: categoriesArray };
    }

    const skip = (page - 1) * limit;

    const recipes = await Recipe.find(query).skip(skip).limit(parseInt(limit));
    const totalRecipes = await Recipe.countDocuments(query);

    res.status(200).json({
      recipes,
      totalRecipes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecipes / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};