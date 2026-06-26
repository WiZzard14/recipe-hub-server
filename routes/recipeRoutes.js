import express from 'express';
import { addRecipe, getAllRecipes, getRecipeById } from '../controllers/recipeController.js';
import { verifyToken } from '../middlewares/verifyToken.js'; 

const router = express.Router();

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);

router.post('/', verifyToken, addRecipe);

export default router;