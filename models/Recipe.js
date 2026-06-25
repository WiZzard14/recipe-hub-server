import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    recipeName: { type: String, required: true },
    recipeImage: { type: String, required: true },
    category: { type: String, required: true },
    cuisineType: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    preparationTime: { type: String, required: true },
    ingredients: { type: Array, required: true },
    instructions: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
  },
  { timestamps: true } 
);

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;