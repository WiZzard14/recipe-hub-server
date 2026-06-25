import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  recipeId: { type: String }, 
  transactionId: { type: String, required: true },
  paymentStatus: { type: String, default: 'success' },
  paidAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;