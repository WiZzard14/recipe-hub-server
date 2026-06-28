import express from 'express';
import {
  addRecipe,
  deleteRecipe,
  getAllRecipes,
  getFeaturedRecipes,
  getMyRecipes,
  getPopularRecipes,
  getRecipeById,
  reportRecipe,
  toggleFavoriteRecipe,
  toggleFeatureRecipe,
  toggleLikeRecipe,
  updateRecipe,
} from '../controllers/recipeController.js';
import { optionalToken, verifyAdmin, verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/', getAllRecipes);
router.get('/featured', getFeaturedRecipes);
router.get('/popular', getPopularRecipes);
router.get('/my-recipes', verifyToken, getMyRecipes);
router.post('/', verifyToken, addRecipe);
router.get('/:id', optionalToken, getRecipeById);
router.put('/:id', verifyToken, updateRecipe);
router.delete('/:id', verifyToken, deleteRecipe);
router.patch('/:id/like', verifyToken, toggleLikeRecipe);
router.patch('/:id/feature', verifyToken, verifyAdmin, toggleFeatureRecipe);
router.post('/:id/favorite', verifyToken, toggleFavoriteRecipe);
router.post('/:id/report', verifyToken, reportRecipe);

export default router;
