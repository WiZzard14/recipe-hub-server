import express from 'express';
import { register, login, logout, googleLogin, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/me', getMe); 

export default router;