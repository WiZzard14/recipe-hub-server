import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'bdt' },
    type: { type: String, enum: ['premium', 'recipe'], required: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    transactionId: { type: String, required: true, unique: true },
    paymentStatus: { type: String, default: 'success' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
