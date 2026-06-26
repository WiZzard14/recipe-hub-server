import Recipe from '../models/Recipe.js';

const addRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully!", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 6; 
    
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find()
                          .sort({ createdAt: -1 }) 
                          .skip(skip)
                          .limit(limit);

    const totalRecipes = await Recipe.countDocuments();
    const totalPages = Math.ceil(totalRecipes / limit);

    res.status(200).json({
      recipes,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server Error to get recipes" });
  }
};

export { addRecipe, getAllRecipes };