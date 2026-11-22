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

        const stmt = db.prepare(`
        INSERT INTO recipes (title, category, image, description, ingredients, instructions)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

        const result = stmt.run(
          newRecipe.title,
          newRecipe.category,
          newRecipe.image,
          newRecipe.description,
          JSON.stringify(newRecipe.ingredients),
          newRecipe.instructions,
        );

        const savedRecipe = {
          id: result.lastInsertRowid,
          ...newRecipe,
        };

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(savedRecipe));
      } catch (error) {
        console.error('Failed to save recipe:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save recipe' }));
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

    try {
      const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Recipe not found' }));
        return;
      }

      res.writeHead(204);
      res.end();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to delete recipe' }));
    }

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

        const stmt = db.prepare(`
        UPDATE recipes
        SET title = ?, category = ?, image = ?, description = ?, ingredients = ?, instructions = ?
        WHERE id = ?
      `);

        const result = stmt.run(
          updatedData.title,
          updatedData.category,
          updatedData.image,
          updatedData.description,
          JSON.stringify(updatedData.ingredients),
          updatedData.instructions,
          id,
        );

        if (result.changes === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Recipe not found' }));
          return;
        }

        const row = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
        const savedRecipe = {
          ...row,
          ingredients: JSON.parse(row.ingredients),
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(savedRecipe));
      } catch (error) {
        console.error('Failed to update recipe:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to update recipe' }));
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
