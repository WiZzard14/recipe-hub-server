import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getMyFavorites,
  getPurchasedRecipes,
  getUserStats,
  removeFavorite,
  setBlockStatus,
  updateProfile,
} from '../controllers/userController.js';
import { verifyAdmin, verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/stats', verifyToken, getUserStats);
router.get('/favorites', verifyToken, getMyFavorites);
router.delete('/favorites/:recipeId', verifyToken, removeFavorite);
router.get('/purchased', verifyToken, getPurchasedRecipes);
router.put('/profile', verifyToken, updateProfile);
router.get('/admin/stats', verifyToken, verifyAdmin, getAdminStats);
router.get('/admin/all', verifyToken, verifyAdmin, getAllUsers);
router.patch('/admin/:id/block', verifyToken, verifyAdmin, setBlockStatus);

export default router;
