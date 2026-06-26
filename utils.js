import mongoose from 'mongoose';

export const toSafeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    image: user.image || '',
    role: user.role || 'user',
    isBlocked: Boolean(user.isBlocked),
    isPremium: Boolean(user.isPremium),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : (process.env.COOKIE_SAMESITE || 'lax'),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 8, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';
