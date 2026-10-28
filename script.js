let allRecipes = [];

const filtersContainer = document.querySelector('.filters');
const recipesCount = document.querySelector('.recipes-count');
const recipesEmpty = document.querySelector('.recipes-empty');
const recipesContainer = document.querySelector('.recipes');
const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal__close');
const modalImage = document.querySelector('.modal__image');
const modalTitle = document.querySelector('.modal__title');
const modalCategory = document.querySelector('.modal__category');
const modalTime = document.querySelector('.modal__time');
const modalDescription = document.querySelector('.modal__description');
const modalIngredients = document.querySelector('.modal__ingredients-list');
const modalInstructions = document.querySelector('.modal__instructions-text');

function createRecipeCard(recipe) {
  return `
        <article class="recipe-card" data-id="${recipe.id}">
          <img
            src="${recipe.image}"
            alt="${recipe.title}"
            loading="lazy"
          />
          <div class="recipe-card__content">
            <h3 class="recipe-card__title">
              <button class="recipe-card__btn" type="button">${recipe.title}</button>
            </h3>
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

  const count = recipes.length;
  const word = count === 1 ? 'recipe' : 'recipes';
  recipesCount.textContent = `${count} ${word}`;

  recipesEmpty.hidden = count > 0;
}

function openModal(recipe) {
  modalImage.onerror = () => {
    modalImage.src = 'https://placehold.co/500x300?text=No+Image';
  };
  modalImage.src = recipe.image;
  modalImage.alt = recipe.title;
  modalTitle.textContent = recipe.title;
  modalCategory.className = `modal__category modal__category--${recipe.category}`;
  modalCategory.textContent = recipe.category;
  modalTime.textContent = '15 min';
  modalDescription.textContent = recipe.description;

  modalIngredients.innerHTML = recipe.ingredients
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join('');

  modalInstructions.textContent = recipe.instructions;

  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';

  modal.showModal();
}

function handleCardClick(event) {
  const card = event.target.closest('.recipe-card');
  if (!card) return;

  const id = Number(card.dataset.id);
  const recipe = allRecipes.find((r) => r.id === id);

  if (recipe) {
    openModal(recipe);
  }
}

function closeModal() {
  modal.classList.add('modal--closing');

  setTimeout(() => {
    modal.close();
    modal.classList.remove('modal--closing');
  }, 300);
}

function handleFilterClick(event) {
  const btn = event.target.closest('.filters__btn');
  if (!btn) return;

  const category = btn.dataset.category;

  try {
    localStorage.setItem('recipeFilter', category);
  } catch (e) {
    // localStorage unavailable (private mode) — ignore
  }

  document.querySelectorAll('.filters__btn').forEach((b) => {
    b.classList.remove('filters__btn--active');
    b.setAttribute('aria-pressed', 'false');
  });

  btn.classList.add('filters__btn--active');
  btn.setAttribute('aria-pressed', 'true');

  const filtered =
    category === 'all'
      ? allRecipes
      : allRecipes.filter((r) => r.category === category);

  renderRecipes(filtered);
}

function initFilters(recipes) {
  let saved = 'all';

  try {
    saved = localStorage.getItem('recipeFilter') || 'all';
  } catch (e) {
    // localStorage unavailable — fallback to 'all'
  }

  const btn = document.querySelector(`.filters__btn[data-category="${saved}"]`);

  if (!btn) {
    renderRecipes(recipes);
    return;
  }

  document.querySelectorAll('.filters__btn').forEach((b) => {
    b.classList.remove('filters__btn--active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('filters__btn--active');
  btn.setAttribute('aria-pressed', 'true');

  const filtered =
    saved === 'all' ? recipes : recipes.filter((r) => r.category === saved);
  renderRecipes(filtered);
}

filtersContainer.addEventListener('click', handleFilterClick);

recipesContainer.addEventListener(
  'error',
  (event) => {
    const img = event.target;

    if (img.tagName !== 'IMG') return;
    if (img.dataset.fallback) return;

    img.dataset.fallback = 'true';
    img.src = 'https://placehold.co/300x200?text=No+Image';
  },
  true,
);

modal.addEventListener('close', () => {
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
});

modal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModal();
});

async function loadRecipes() {
  try {
    const response = await fetch('/api/recipes');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return null;
  }
}

async function init() {
  const data = await loadRecipes();

  if (!data) {
    recipesCount.textContent = 'Failed to load recipes';
    return;
  }

  allRecipes = data;
  initFilters(allRecipes);
}

init();

recipesContainer.addEventListener('click', handleCardClick);
modalClose.addEventListener('click', () => {
  closeModal();
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
