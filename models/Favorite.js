import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },
  recipeId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;