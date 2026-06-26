import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => res.send('RecipeHub Server is running perfectly!'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'RecipeHub API' }));
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in environment variables.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Successfully connected to MongoDB!');
};

connectDB()
  .then(() => app.listen(port, () => console.log(`Server is running on port: ${port}`)))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
