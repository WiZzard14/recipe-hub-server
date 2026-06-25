import express from 'express';
import { addRecipe, getAllRecipes } from '../controllers/recipeController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/', getAllRecipes);

router.post('/', verifyToken, addRecipe);

export default router;