import Recipe from '../models/Recipe.js';
import Favorite from '../models/Favorite.js';
import Payment from '../models/Payment.js';
import Report from '../models/Report.js';
import { asyncHandler, getPagination, isValidObjectId } from '../utils.js';

const getRecipeOr404 = async (id, res) => {
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid recipe id.' });
    return null;
  }
  const recipe = await Recipe.findById(id);
  if (!recipe || recipe.status === 'removed') {
    res.status(404).json({ message: 'Recipe not found.' });
    return null;
  }
  return recipe;
};

const ensureOwnerOrAdmin = (recipe, user) => {
  const ownerId = recipe.authorId?.toString();
  return user?.role === 'admin' || ownerId === user?.id;
};

export const addRecipe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.isPremium) {
    const count = await Recipe.countDocuments({ authorId: user.id, status: { $ne: 'removed' } });
    if (count >= 2) {
      return res.status(403).json({ message: 'Normal users can add maximum 2 recipes. Upgrade to premium for unlimited recipes.' });
    }
  }
  const payload = {
    ...req.body,
    authorId: user.id,
    authorName: user.name,
    authorEmail: user.email,
    ingredients: Array.isArray(req.body.ingredients)
      ? req.body.ingredients.filter(Boolean)
      : String(req.body.ingredients || '').split(',').map((item) => item.trim()).filter(Boolean),
  };
  const recipe = await Recipe.create(payload);
  return res.status(201).json({ message: 'Recipe added successfully.', recipe });
});

export const getAllRecipes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { status: 'active' };
  if (req.query.search) {
    const search = new RegExp(String(req.query.search), 'i');
    query.$or = [{ recipeName: search }, { category: search }, { cuisineType: search }];
  }
  if (req.query.category) {
    const categories = String(req.query.category).split(',').map((item) => item.trim()).filter(Boolean);
    if (categories.length) query.category = { $in: categories };
  }
  const [data, total, categories] = await Promise.all([
    Recipe.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(query),
    Recipe.distinct('category', { status: 'active' }),
  ]);
  return res.json({ data, categories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } });
});

export const getFeaturedRecipes = asyncHandler(async (_req, res) => {
  const recipes = await Recipe.find({ status: 'active', isFeatured: true }).sort({ updatedAt: -1 }).limit(6);
  return res.json(recipes);
});

export const getPopularRecipes = asyncHandler(async (_req, res) => {
  const recipes = await Recipe.find({ status: 'active' }).sort({ likesCount: -1, createdAt: -1 }).limit(6);
  return res.json(recipes);
});

export const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  let isFavorite = false;
  let isPurchased = false;
  if (req.user?.id) {
    const [favorite, payment] = await Promise.all([
      Favorite.findOne({ userId: req.user.id, recipeId: recipe._id }),
      Payment.findOne({ userId: req.user.id, recipeId: recipe._id, type: 'recipe', paymentStatus: 'success' }),
    ]);
    isFavorite = Boolean(favorite);
    isPurchased = Boolean(payment);
  }
  return res.json({ recipe, isFavorite, isPurchased });
});

export const getMyRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ authorId: req.user.id, status: { $ne: 'removed' } }).sort({ createdAt: -1 });
  return res.json(recipes);
});

export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  if (!ensureOwnerOrAdmin(recipe, req.user)) return res.status(403).json({ message: 'You can update only your own recipes.' });
  const allowed = ['recipeName', 'recipeImage', 'category', 'cuisineType', 'difficultyLevel', 'preparationTime', 'ingredients', 'instructions'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      recipe[key] = key === 'ingredients' && !Array.isArray(req.body[key])
        ? String(req.body[key]).split(',').map((item) => item.trim()).filter(Boolean)
        : req.body[key];
    }
  });
  await recipe.save();
  return res.json({ message: 'Recipe updated successfully.', recipe });
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  if (!ensureOwnerOrAdmin(recipe, req.user)) return res.status(403).json({ message: 'You can delete only your own recipes.' });
  recipe.status = 'removed';
  await recipe.save();
  return res.json({ message: 'Recipe removed successfully.' });
});

export const toggleLikeRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  const userId = req.user.id;
  const isLiked = recipe.likes.some((id) => id.toString() === userId);
  recipe.likes = isLiked
    ? recipe.likes.filter((id) => id.toString() !== userId)
    : [...recipe.likes, userId];
  recipe.likesCount = recipe.likes.length;
  await recipe.save();
  return res.json({ message: isLiked ? 'Unliked.' : 'Liked.', likesCount: recipe.likesCount, isLiked: !isLiked });
});

export const toggleFeatureRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  recipe.isFeatured = !recipe.isFeatured;
  await recipe.save();
  return res.json({ message: recipe.isFeatured ? 'Recipe featured.' : 'Recipe unfeatured.', recipe });
});

export const toggleFavoriteRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  const favorite = await Favorite.findOne({ userId: req.user.id, recipeId: recipe._id });
  if (favorite) {
    await favorite.deleteOne();
    return res.json({ message: 'Removed from favorites.', isFavorite: false });
  }
  await Favorite.create({ userId: req.user.id, userEmail: req.user.email, recipeId: recipe._id });
  return res.json({ message: 'Added to favorites.', isFavorite: true });
});

export const reportRecipe = asyncHandler(async (req, res) => {
  const recipe = await getRecipeOr404(req.params.id, res);
  if (!recipe) return null;
  const { reason } = req.body;
  const validReasons = ['Spam', 'Offensive Content', 'Copyright Issue'];
  if (!validReasons.includes(reason)) return res.status(400).json({ message: 'Invalid report reason.' });
  const report = await Report.create({ recipeId: recipe._id, reporterEmail: req.user.email, reporterId: req.user.id, reason });
  return res.status(201).json({ message: 'Report submitted successfully.', report });
});
