const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const recipes = [
  {
    id: 1,
    title: 'Classic Pancakes',
    category: 'breakfast',
    image: 'https://placehold.co/300x200',
    description: 'Fluffy pancakes served with maple syrup',
    ingredients: ['Flour', 'Milk', 'Eggs', 'Sugar', 'Baking powder'],
    instructions:
      'Mix dry ingredients. Add wet ingredients. Cook on a non-stick pan until golden.',
  },
  {
    id: 2,
    title: 'Avocado Toast',
    category: 'breakfast',
    image: 'https://placehold.co/300x200',
    description: 'Crispy toast topped with fresh avocado and a poached egg',
    ingredients: ['Bread', 'Avocado', 'Egg', 'Salt', 'Pepper', 'Lemon juice'],
    instructions:
      'Toast the bread. Mash avocado with lemon, salt and pepper. Spread on toast. Top with a poached egg.',
  },
  {
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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

const server = http.createServer((req, res) => {
  if (req.url === '/api/recipes' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(recipes));
    return;
  }

  let urlPath = req.url === '/' ? '/index.html' : req.url;
  urlPath = urlPath.split('?')[0];
  const filePath = path.join(__dirname, urlPath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
