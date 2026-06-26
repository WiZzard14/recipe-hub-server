import express from 'express';
import { createCheckoutSession, getTransactions, savePayment } from '../controllers/paymentController.js';
import { verifyAdmin, verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/success', verifyToken, savePayment);
router.get('/transactions', verifyToken, verifyAdmin, getTransactions);

export default router;
