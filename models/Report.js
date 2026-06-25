import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  recipeId: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);
export default Report;