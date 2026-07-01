import Favorite from '../models/Favorite.js';
import Payment from '../models/Payment.js';
import Recipe from '../models/Recipe.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { asyncHandler, getPagination, toSafeUser } from '../utils.js';

export const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user.id }).populate('recipeId').sort({ addedAt: -1 });
  const recipes = favorites.map((favorite) => favorite.recipeId).filter((recipe) => recipe && recipe.status !== 'removed');
  return res.json(recipes);
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ userId: req.user.id, recipeId: req.params.recipeId });
  return res.json({ message: 'Favorite removed.' });
});

export const getPurchasedRecipes = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id, type: 'recipe', paymentStatus: 'success' })
    .populate('recipeId')
    .sort({ paidAt: -1 });
  return res.json(payments);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...(name ? { name: name.trim() } : {}), ...(image !== undefined ? { image } : {}) },
    { returnDocument: 'after' }
  );
  return res.json({ message: 'Profile updated successfully.', user: toSafeUser(user) });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const [totalRecipes, totalFavorites, ownRecipes, premiumPayment] = await Promise.all([
    Recipe.countDocuments({ authorId: req.user.id, status: { $ne: 'removed' } }),
    Favorite.countDocuments({ userId: req.user.id }),
    Recipe.find({ authorId: req.user.id, status: { $ne: 'removed' } }).select('likesCount'),
    Payment.findOne({ userId: req.user.id, type: 'premium', paymentStatus: 'success' }),
  ]);
  const totalLikesReceived = ownRecipes.reduce((sum, recipe) => sum + (recipe.likesCount || 0), 0);
  return res.json({ totalRecipes, totalFavorites, totalLikesReceived, isPremium: req.user.isPremium, hasPremiumPayment: Boolean(premiumPayment) });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
    User.countDocuments(),
  ]);
  return res.json({ data: users.map(toSafeUser), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } });
});

export const setBlockStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot block your own account.' });
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: req.body.isBlocked }, { returnDocument: 'after' }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json({ message: user.isBlocked ? 'User blocked.' : 'User unblocked.', user: toSafeUser(user) });
});

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalRecipes, totalPremiumMembers, totalReports] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments({ status: { $ne: 'removed' } }),
    User.countDocuments({ isPremium: true }),
    Report.countDocuments(),
  ]);
  return res.json({ totalUsers, totalRecipes, totalPremiumMembers, totalReports });
});
