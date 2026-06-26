import express from 'express';
import { addRecipe, getAllRecipes, getRecipeById } from '../controllers/recipeController.js';

const router = express.Router();

router.post('/', addRecipe);
router.get('/', getAllRecipes);

router.get('/:id', getRecipeById);

export default router;