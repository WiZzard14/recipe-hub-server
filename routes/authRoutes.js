import express from 'express';
import { getMe, googleLogin, login, logout, register } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);

export default router;
