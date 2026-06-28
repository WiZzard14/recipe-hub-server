import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, cookieOptions, toSafeUser } from '../utils.js';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

const signToken = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, isPremium: user.isPremium, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const sendAuthResponse = (res, user, message) => {
  const token = signToken(user);
  res.cookie('token', token, cookieOptions());
  return res.status(200).json({ message, user: toSafeUser(user) });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, image } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters with one uppercase and one lowercase letter.' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(409).json({ message: 'User already exists with this email.' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    image: image || '',
    role: adminEmail && normalizedEmail === adminEmail ? 'admin' : 'user',
  });
  return res.status(201).json({ message: 'User registered successfully.', user: toSafeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.isBlocked) return res.status(403).json({ message: 'Your account is blocked by admin.' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
  return sendAuthResponse(res, user, 'Logged in successfully.');
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { name, email, image } = req.body;
  if (!email) return res.status(400).json({ message: 'Google email is required.' });
  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const generatedPassword = `${Math.random().toString(36).slice(2)}Aa`;
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    user = await User.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      image: image || '',
      password: hashedPassword,
      role: adminEmail && normalizedEmail === adminEmail ? 'admin' : 'user',
    });
  }
  if (user.isBlocked) return res.status(403).json({ message: 'Your account is blocked by admin.' });
  return sendAuthResponse(res, user, 'Google login successful.');
});

export const getMe = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : (process.env.COOKIE_SAMESITE || 'lax'),
  });
  return res.json({ message: 'Logged out successfully.' });
});
