let allRecipes = [];
let currentSearch = '';
let currentSort = 'default';
let currentRecipeId = null;

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
const addBtn = document.querySelector('.add-btn');
const formModal = document.querySelector('.form-modal');
const formModalClose = document.querySelector('.form-modal__close');
const recipeForm = document.querySelector('#recipeForm');
const modalDelete = document.querySelector('.modal__delete');
const modalEdit = document.querySelector('.modal__edit');
const formTitle = document.querySelector('.form__title');
const formSubmit = document.querySelector('.form__submit');
const formErrors = document.querySelector('.form__errors');
const searchInput = document.querySelector('.search__input');
const sortSelect = document.querySelector('#sortSelect');
const themeToggle = document.querySelector('.theme-toggle');

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
  currentRecipeId = recipe.id;
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

function openEditForm() {
  if (!currentRecipeId) return;

  const recipe = allRecipes.find((r) => r.id === currentRecipeId);
  if (!recipe) return;

  formTitle.textContent = 'Edit Recipe';
  formSubmit.textContent = 'Save Changes';

  recipeForm.elements.title.value = recipe.title;
  recipeForm.elements.category.value = recipe.category;
  recipeForm.elements.image.value = recipe.image;
  recipeForm.elements.description.value = recipe.description;
  recipeForm.elements.ingredients.value = recipe.ingredients.join('\n');
  recipeForm.elements.instructions.value = recipe.instructions;

  closeModal();
  setTimeout(() => {
    formModal.showModal();
  }, 300);
}

function showFormErrors(errors) {
  if (!errors || errors.length === 0) {
    formErrors.hidden = true;
    formErrors.innerHTML = '';
    return;
  }

  formErrors.innerHTML = `
    <strong>Please fix the following:</strong>
    <ul>
      ${errors.map((err) => `<li>${err}</li>`).join('')}
    </ul>
  `;
  formErrors.hidden = false;
}

function clearFormErrors() {
  formErrors.hidden = true;
  formErrors.innerHTML = '';
}

function closeModal() {
  modal.classList.add('modal--closing');

  setTimeout(() => {
    modal.close();
    modal.classList.remove('modal--closing');
  }, 300);
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

function handleFilterClick(event) {
  const btn = event.target.closest('.filters__btn');
  if (!btn) return;

  const category = btn.dataset.category;

  try {
    localStorage.setItem('recipeFilter', category);
  } catch (e) {
    // localStorage unavailable — ignore
  }

  document.querySelectorAll('.filters__btn').forEach((b) => {
    b.classList.remove('filters__btn--active');
    b.setAttribute('aria-pressed', 'false');
  });

  btn.classList.add('filters__btn--active');
  btn.setAttribute('aria-pressed', 'true');

  applyFilters();
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

  applyFilters();
}

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';

  try {
    localStorage.setItem('recipeTheme', theme);
  } catch (e) {
    // localStorage unavailable — ignore
  }
}

function initTheme() {
  let saved = 'light';

  try {
    saved = localStorage.getItem('recipeTheme') || 'light';
  } catch (e) {
    // localStorage unavailable — fallback to 'light'
  }

  if (!saved) {
    saved = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  applyTheme(saved);
}

function sortRecipes(recipes) {
  const sorted = [...recipes];

  switch (currentSort) {
    case 'title-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'id-desc':
      sorted.sort((a, b) => b.id - a.id);
      break;
    case 'id-asc':
      sorted.sort((a, b) => a.id - b.id);
      break;
    default:
      // 'default' — no sorting
      break;
  }

  return sorted;
}

function applyFilters() {
  let filtered = allRecipes;

  const activeBtn = document.querySelector('.filters__btn--active');
  const category = activeBtn ? activeBtn.dataset.category : 'all';

  if (category !== 'all') {
    filtered = filtered.filter((r) => r.category === category);
  }

  if (currentSearch) {
    const query = currentSearch.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query),
    );
  }

  filtered = sortRecipes(filtered);

  renderRecipes(filtered);
}

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

async function handleFormSubmit(event) {
  event.preventDefault();

  clearFormErrors();

  const formData = new FormData(recipeForm);
  const data = Object.fromEntries(formData);

  data.ingredients = data.ingredients
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s);

  const isEdit = currentRecipeId !== null;
  const url = isEdit ? `/api/recipes/${currentRecipeId}` : '/api/recipes';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.details && Array.isArray(errorData.details)) {
        showFormErrors(errorData.details);
      } else {
        showFormErrors([errorData.error || 'Something went wrong']);
      }
      return;
    }

    const savedRecipe = await response.json();

    if (isEdit) {
      const index = allRecipes.findIndex((r) => r.id === currentRecipeId);
      if (index !== -1) {
        allRecipes[index] = savedRecipe;
      }
    } else {
      allRecipes.push(savedRecipe);
    }

    renderRecipes(allRecipes);

    formModal.close();
    recipeForm.reset();
    formTitle.textContent = 'Add New Recipe';
    formSubmit.textContent = 'Add Recipe';
    currentRecipeId = null;
  } catch (error) {
    console.error('Failed to save recipe:', error);
    showFormErrors(['Network error. Please check your connection.']);
  }
}

async function handleDelete() {
  if (!currentRecipeId) return;

  const confirmed = confirm('Are you sure you want to delete this recipe?');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/recipes/${currentRecipeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    allRecipes = allRecipes.filter((r) => r.id !== currentRecipeId);

    closeModal();

    renderRecipes(allRecipes);

    currentRecipeId = null;
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    alert('Failed to delete recipe. Please try again.');
  }
}

async function init() {
  initTheme();

  const data = await loadRecipes();

  if (!data) {
    recipesCount.textContent = 'Failed to load recipes';
    return;
  }

  allRecipes = data;
  initFilters(allRecipes);
}

const handleSearch = debounce((event) => {
  currentSearch = event.target.value.trim();
  applyFilters();
}, 300);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

searchInput.addEventListener('input', handleSearch);

sortSelect.addEventListener('change', (event) => {
  currentSort = event.target.value;
  applyFilters();
});

filtersContainer.addEventListener('click', handleFilterClick);

recipesContainer.addEventListener('click', handleCardClick);
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

modalClose.addEventListener('click', () => {
  closeModal();
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
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

addBtn.addEventListener('click', () => {
  recipeForm.reset();
  formTitle.textContent = 'Add New Recipe';
  formSubmit.textContent = 'Add Recipe';
  currentRecipeId = null;

  formModal.showModal();
});

formModalClose.addEventListener('click', () => {
  formModal.close();
});
formModal.addEventListener('click', (event) => {
  if (event.target === formModal) {
    formModal.close();
  }
});

recipeForm.addEventListener('submit', handleFormSubmit);

modalEdit.addEventListener('click', openEditForm);

modalDelete.addEventListener('click', handleDelete);

init();
