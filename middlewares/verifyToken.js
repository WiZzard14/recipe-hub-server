import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { toSafeUser } from '../utils.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Access denied. Please login first.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User session not found.' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account is blocked by admin.' });
    req.user = { ...decoded, ...toSafeUser(user) };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
};


export const optionalToken = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) req.user = { ...decoded, ...toSafeUser(user) };
  } catch {
    // Optional auth should never block public routes.
  }
  return next();
};
