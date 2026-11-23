const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, 'recipes.db'));

const recipes = [
  {
    title: 'Classic Pancakes',
    category: 'breakfast',
    image: 'https://placehold.co/300x200',
    description: 'Fluffy pancakes served with maple syrup',
    ingredients: ['Flour', 'Milk', 'Eggs', 'Sugar', 'Baking powder'],
    instructions:
      'Mix dry ingredients. Add wet ingredients. Cook on a non-stick pan until golden.',
  },
  {
    title: 'Avocado Toast',
    category: 'breakfast',
    image: 'https://placehold.co/300x200',
    description: 'Crispy toast topped with fresh avocado and a poached egg',
    ingredients: ['Bread', 'Avocado', 'Egg', 'Salt', 'Pepper', 'Lemon juice'],
    instructions:
      'Toast the bread. Mash avocado with lemon, salt and pepper. Spread on toast. Top with a poached egg.',
  },
  {
    title: 'Caesar Salad',
    category: 'lunch',
    image: 'https://placehold.co/300x200',
    description: 'Classic Caesar salad with crunchy croutons and parmesan',
    ingredients: [
      'Romaine lettuce',
      'Croutons',
      'Parmesan',
      'Caesar dressing',
      'Lemon',
    ],
    instructions:
      'Chop lettuce. Add croutons and parmesan. Drizzle with dressing and toss well.',
  },
  {
    title: 'Grilled Chicken Wrap',
    category: 'lunch',
    image: 'https://placehold.co/300x200',
    description:
      'Juicy grilled chicken with fresh veggies wrapped in a soft tortilla',
    ingredients: [
      'Chicken breast',
      'Tortilla',
      'Lettuce',
      'Tomato',
      'Sour cream',
      'Cheese',
    ],
    instructions:
      'Grill chicken and slice. Layer all ingredients on tortilla. Roll tightly and serve.',
  },
  {
    title: 'Spaghetti Bolognese',
    category: 'dinner',
    image: 'https://placehold.co/300x200',
    description: 'Rich and hearty Italian pasta with a slow-cooked meat sauce',
    ingredients: [
      'Spaghetti',
      'Ground beef',
      'Tomato sauce',
      'Onion',
      'Garlic',
      'Olive oil',
    ],
    instructions:
      'Saute onion and garlic. Add beef and cook. Pour in tomato sauce and simmer 20 minutes. Serve over spaghetti.',
  },
  {
    title: 'Chocolate Brownies',
    category: 'dessert',
    image: 'https://placehold.co/300x200',
    description: 'Fudgy chocolate brownies with a crispy top',
    ingredients: [
      'Butter',
      'Sugar',
      'Eggs',
      'Cocoa powder',
      'Flour',
      'Vanilla extract',
    ],
    instructions:
      'Melt butter. Mix in sugar, eggs and vanilla. Fold in cocoa and flour. Bake at 180°C for 25 minutes.',
  },
];

const count = db.prepare('SELECT COUNT(*) as count FROM recipes').get();
if (count.count > 0) {
  console.log(`Database already has ${count.count} recipes. Skipping seed.`);
  process.exit(0);
}

const stmt = db.prepare(`
  INSERT INTO recipes (title, category, image, description, ingredients, instructions)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const recipe of recipes) {
  stmt.run(
    recipe.title,
    recipe.category,
    recipe.image,
    recipe.description,
    JSON.stringify(recipe.ingredients),
    recipe.instructions,
  );
}

console.log(`Seeded ${recipes.length} recipes.`);
process.exit(0);
