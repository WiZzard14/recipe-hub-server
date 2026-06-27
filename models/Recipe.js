import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    recipeName: { type: String, required: true, trim: true },
    recipeImage: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    cuisineType: { type: String, required: true, trim: true },
    difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    preparationTime: { type: String, required: true, trim: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

recipeSchema.pre('save', function updateLikesCount() {
  this.likesCount = Array.isArray(this.likes) ? this.likes.length : 0;
});

export default mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
