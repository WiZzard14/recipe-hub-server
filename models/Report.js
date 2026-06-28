import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    reporterEmail: { type: String, required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: ['Spam', 'Offensive Content', 'Copyright Issue'], required: true },
    status: { type: String, enum: ['pending', 'dismissed', 'removed'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
