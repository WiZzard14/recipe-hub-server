import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000'], 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-nwzaq01-shard-00-00.ebqnyaj.mongodb.net:27017,ac-nwzaq01-shard-00-01.ebqnyaj.mongodb.net:27017,ac-nwzaq01-shard-00-02.ebqnyaj.mongodb.net:27017/recipeHubDB?ssl=true&replicaSet=atlas-d0f7yf-shard-0&authSource=admin&appName=MediQueueCluster`;

mongoose.connect(uri)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((error) => console.log("MongoDB connection failed:", error.message));

app.get('/', (req, res) => {
  res.send('RecipeHub Server is running perfectly!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});