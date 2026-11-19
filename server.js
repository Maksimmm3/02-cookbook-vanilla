const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(__dirname, 'recipes.db'));

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

db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    description TEXT,
    ingredients TEXT,
    instructions TEXT
  )
`);

function validateRecipe(data) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('title is required');
  }

  const validCategories = ['breakfast', 'lunch', 'dinner', 'dessert'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('category must be one of: ' + validCategories.join(', '));
  }

  if (!data.image || typeof data.image !== 'string' || !data.image.trim()) {
    errors.push('image is required');
  }

  if (
    !data.description ||
    typeof data.description !== 'string' ||
    !data.description.trim()
  ) {
    errors.push('description is required');
  }

  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push('ingredients must be a non-empty array');
  }

  if (
    !data.instructions ||
    typeof data.instructions !== 'string' ||
    !data.instructions.trim()
  ) {
    errors.push('instructions is required');
  }

  return errors;
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/recipes' && req.method === 'GET') {
    try {
      const rows = db.prepare('SELECT * FROM recipes').all();

      const recipes = rows.map((row) => ({
        ...row,
        ingredients: JSON.parse(row.ingredients),
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(recipes));
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to load recipes' }));
    }
    return;
  }

  if (req.url === '/api/recipes' && req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const newRecipe = JSON.parse(body);

        const errors = validateRecipe(newRecipe);
        if (errors.length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid recipe', details: errors }));
          return;
        }

        const recipesPath = path.join(__dirname, 'recipes.json');

        fs.readFile(recipesPath, 'utf-8', (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read recipes' }));
            return;
          }

          const recipes = JSON.parse(data);
          const newId =
            recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1;

          const recipeToSave = { id: newId, ...newRecipe };
          recipes.push(recipeToSave);

          fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to save recipe' }));
              return;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(recipeToSave));
          });
        });
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    return;
  }

  if (req.url.startsWith('/api/recipes/') && req.method === 'DELETE') {
    const id = Number(req.url.split('/').pop());

    if (isNaN(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid id' }));
      return;
    }

    const recipesPath = path.join(__dirname, 'recipes.json');

    fs.readFile(recipesPath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read recipes' }));
        return;
      }

      const recipes = JSON.parse(data);
      const filtered = recipes.filter((r) => r.id !== id);

      if (filtered.length === recipes.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Recipe not found' }));
        return;
      }

      fs.writeFile(recipesPath, JSON.stringify(filtered, null, 2), (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to delete recipe' }));
          return;
        }

        res.writeHead(204);
        res.end();
      });
    });

    return;
  }

  if (req.url.startsWith('/api/recipes/') && req.method === 'PUT') {
    const id = Number(req.url.split('/').pop());

    if (isNaN(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid id' }));
      return;
    }

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const updatedData = JSON.parse(body);

        const errors = validateRecipe(updatedData);
        if (errors.length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid recipe', details: errors }));
          return;
        }

        const recipesPath = path.join(__dirname, 'recipes.json');

        fs.readFile(recipesPath, 'utf-8', (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read recipes' }));
            return;
          }

          const recipes = JSON.parse(data);
          const index = recipes.findIndex((r) => r.id === id);

          if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Recipe not found' }));
            return;
          }

          recipes[index] = { ...recipes[index], ...updatedData, id };

          fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to update recipe' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(recipes[index]));
          });
        });
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

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
