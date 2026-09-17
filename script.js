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

const recipesContainer = document.querySelector('.recipes');

function createRecipeCard(recipe) {
  return `
        <article class="recipe-card">
          <img
            src="${recipe.image}"
            alt="${recipe.title}"
            loading="lazy"
          />
          <div class="recipe-card__content">
            <h3 class="recipe-card__title"><a href="#">${recipe.title}</a></h3>
            <p class="recipe-card__description">${recipe.description}</p>
            <div class="recipe-card__meta">
              <span
                class="recipe-card__category recipe-card__category--${recipe.category}"
                >${recipe.category}</span
              >
              <span class="recipe-card__time">15 min</span>
            </div>
          </div>
        </article>

  `;
}

function renderRecipes(recipes) {
  const cardsHTML = recipes.map(createRecipeCard).join('');
  recipesContainer.innerHTML = cardsHTML;
}

renderRecipes(recipes);
