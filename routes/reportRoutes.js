import express from 'express';
import { dismissReport, getReports, removeReportedRecipe } from '../controllers/reportController.js';
import { verifyAdmin, verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getReports);
router.patch('/:id/dismiss', verifyToken, verifyAdmin, dismissReport);
router.patch('/:id/remove-recipe', verifyToken, verifyAdmin, removeReportedRecipe);

export default router;
