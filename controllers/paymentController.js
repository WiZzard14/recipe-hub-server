import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { asyncHandler, getClientUrl } from '../utils.js';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key.includes('replace') || key.includes('your_') || !key.startsWith('sk_')) return null;
  return new Stripe(key);
};

const buildDemoCheckoutUrl = ({ clientUrl, checkoutType, recipeId, amount, name, reason }) => {
  const params = new URLSearchParams({
    type: checkoutType,
    amount: String(amount),
    title: name,
    reason: reason || 'Demo checkout is enabled because Stripe key is not configured.',
  });
  if (recipeId) params.set('recipeId', recipeId);
  return `${clientUrl}/payment/demo-checkout?${params.toString()}`;
};

const toAmount = (value, fallback) => Number.parseInt(value, 10) || fallback;

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { type, recipeId } = req.body;
  const checkoutType = type === 'recipe' ? 'recipe' : 'premium';
  let amount = toAmount(process.env.PREMIUM_PRICE_BDT, 500);
  let name = 'RecipeHub Premium Membership';
  const metadata = { userId: req.user.id, userEmail: req.user.email, type: checkoutType };

  if (checkoutType === 'recipe') {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    amount = toAmount(process.env.RECIPE_PRICE_BDT, 100);
    name = `RecipeHub Recipe: ${recipe.recipeName}`;
    metadata.recipeId = recipe._id.toString();
  }

  const stripe = getStripe();
  const clientUrl = getClientUrl();

  if (!stripe) {
    return res.json({
      url: buildDemoCheckoutUrl({ clientUrl, checkoutType, recipeId, amount, name }),
      devMode: true,
      message: 'Stripe secret key is missing, so demo checkout is enabled.',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: (process.env.STRIPE_CURRENCY || 'bdt').toLowerCase(),
            product_data: { name },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${checkoutType}${recipeId ? `&recipeId=${recipeId}` : ''}`,
      cancel_url: `${clientUrl}${recipeId ? `/recipe/${recipeId}` : '/dashboard/profile'}`,
    });

    return res.json({ url: session.url, devMode: false });
  } catch (error) {
    return res.json({
      url: buildDemoCheckoutUrl({
        clientUrl,
        checkoutType,
        recipeId,
        amount,
        name,
        reason: error?.message || 'Stripe checkout could not be created. Demo checkout is enabled.',
      }),
      devMode: true,
      message: error?.message || 'Stripe checkout failed, using demo checkout.',
    });
  }
});

export const savePayment = asyncHandler(async (req, res) => {
  const { sessionId, type, recipeId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'Payment session id is missing.' });
  const checkoutType = type === 'recipe' ? 'recipe' : 'premium';
  const amount = checkoutType === 'recipe'
    ? toAmount(process.env.RECIPE_PRICE_BDT, 100)
    : toAmount(process.env.PREMIUM_PRICE_BDT, 500);

  let transactionId = sessionId;
  const stripe = getStripe();
  if (stripe && sessionId && !sessionId.startsWith('dev_')) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment is not completed.' });
    transactionId = session.payment_intent || session.id;
  }

  const payment = await Payment.findOneAndUpdate(
    { transactionId },
    {
      userEmail: req.user.email,
      userId: req.user.id,
      amount,
      type: checkoutType,
      recipeId: recipeId || undefined,
      transactionId,
      paymentStatus: 'success',
      paidAt: new Date(),
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  if (checkoutType === 'premium') {
    await User.findByIdAndUpdate(req.user.id, { isPremium: true });
  }

  return res.json({ message: 'Payment saved successfully.', payment });
});

export const getTransactions = asyncHandler(async (_req, res) => {
  const transactions = await Payment.find().populate('userId', 'name email image').populate('recipeId', 'recipeName').sort({ paidAt: -1 });
  return res.json(transactions);
});
