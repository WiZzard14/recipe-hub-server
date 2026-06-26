import bcrypt from 'bcryptjs';
import Recipe from './models/Recipe.js';
import User from './models/User.js';

const sampleImage = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const defaultRecipes = [
  {
    recipeName: 'Creamy Garlic Butter Chicken',
    recipeImage: sampleImage('photo-1604908176997-125f25cc6f3d'),
    category: 'Dinner',
    cuisineType: 'Continental',
    difficultyLevel: 'Medium',
    preparationTime: '35 minutes',
    ingredients: ['Chicken breast', 'Garlic', 'Butter', 'Cream', 'Parsley', 'Black pepper'],
    instructions: 'Season the chicken. Sear both sides until golden. Make a garlic butter cream sauce in the same pan. Simmer the chicken until tender and serve warm.',
    likesCount: 24,
    isFeatured: true,
  },
  {
    recipeName: 'Spicy Beef Tehari',
    recipeImage: sampleImage('photo-1585937421612-70a008356fbe'),
    category: 'Rice',
    cuisineType: 'Bangladeshi',
    difficultyLevel: 'Hard',
    preparationTime: '1 hour 15 minutes',
    ingredients: ['Beef', 'Basmati rice', 'Potato', 'Onion', 'Ginger garlic paste', 'Tehari masala'],
    instructions: 'Marinate beef with spices. Cook beef until tender. Add fried potatoes and rice, then dum cook until aromatic and fluffy.',
    likesCount: 42,
    isFeatured: true,
  },
  {
    recipeName: 'Classic Margherita Pizza',
    recipeImage: sampleImage('photo-1604382354936-07c5d9983bd3'),
    category: 'Snack',
    cuisineType: 'Italian',
    difficultyLevel: 'Medium',
    preparationTime: '45 minutes',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'],
    instructions: 'Spread sauce over the dough. Add mozzarella and basil. Bake in a hot oven until crust is crisp and cheese is bubbly.',
    likesCount: 31,
    isFeatured: true,
  },
  {
    recipeName: 'Mango Coconut Smoothie',
    recipeImage: sampleImage('photo-1623065422902-30a2d299bbe4'),
    category: 'Drink',
    cuisineType: 'Fusion',
    difficultyLevel: 'Easy',
    preparationTime: '8 minutes',
    ingredients: ['Mango', 'Coconut milk', 'Yogurt', 'Honey', 'Ice'],
    instructions: 'Blend all ingredients until smooth. Serve chilled with mango cubes on top.',
    likesCount: 19,
  },
  {
    recipeName: 'Vegetable Fried Rice',
    recipeImage: sampleImage('photo-1603133872878-684f208fb84b'),
    category: 'Lunch',
    cuisineType: 'Chinese',
    difficultyLevel: 'Easy',
    preparationTime: '25 minutes',
    ingredients: ['Cooked rice', 'Mixed vegetables', 'Egg', 'Soy sauce', 'Garlic', 'Spring onion'],
    instructions: 'Stir-fry garlic and vegetables. Add egg, rice and soy sauce. Toss on high heat and finish with spring onion.',
    likesCount: 16,
  },
  {
    recipeName: 'Tomato Basil Pasta',
    recipeImage: sampleImage('photo-1551892374-ecf8754cf8b0'),
    category: 'Dinner',
    cuisineType: 'Italian',
    difficultyLevel: 'Easy',
    preparationTime: '30 minutes',
    ingredients: ['Pasta', 'Tomato', 'Garlic', 'Basil', 'Olive oil', 'Parmesan'],
    instructions: 'Cook pasta. Prepare tomato garlic sauce, toss pasta in the sauce and garnish with basil and parmesan.',
    likesCount: 22,
  },
  {
    recipeName: 'Chicken Shawarma Wrap',
    recipeImage: sampleImage('photo-1529006557810-274b9b2fc783'),
    category: 'Snack',
    cuisineType: 'Middle Eastern',
    difficultyLevel: 'Medium',
    preparationTime: '40 minutes',
    ingredients: ['Chicken', 'Flatbread', 'Yogurt', 'Garlic sauce', 'Cucumber', 'Shawarma spice'],
    instructions: 'Marinate and grill chicken. Slice thinly and wrap with vegetables and garlic sauce in warm flatbread.',
    likesCount: 28,
  },
  {
    recipeName: 'Chocolate Mug Cake',
    recipeImage: sampleImage('photo-1606313564200-e75d5e30476c'),
    category: 'Dessert',
    cuisineType: 'American',
    difficultyLevel: 'Easy',
    preparationTime: '7 minutes',
    ingredients: ['Flour', 'Cocoa powder', 'Sugar', 'Milk', 'Oil', 'Chocolate chips'],
    instructions: 'Mix ingredients in a mug. Microwave until set and serve warm with chocolate chips.',
    likesCount: 35,
  },
];

export async function seedDefaults() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@recipehub.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $setOnInsert: {
        name: process.env.ADMIN_NAME || 'RecipeHub Admin',
        email: adminEmail,
        image: process.env.ADMIN_IMAGE || '',
        password: hashedPassword,
      },
      $set: {
        role: 'admin',
        isBlocked: false,
        isPremium: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const recipeCount = await Recipe.countDocuments();
  if (recipeCount === 0) {
    await Recipe.insertMany(defaultRecipes.map((recipe) => ({
      ...recipe,
      authorId: admin._id,
      authorName: admin.name,
      authorEmail: admin.email,
      status: 'active',
    })));
    console.log(`Seeded ${defaultRecipes.length} sample recipes.`);
  }

  console.log(`Ready admin account: ${adminEmail}`);
}
