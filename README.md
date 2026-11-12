# Recipe Library — Fullstack Vanilla

A fullstack recipe library built with **pure HTML, CSS, JavaScript, and Node.js** — no frameworks, no libraries. A portfolio project demonstrating core web development fundamentals on both frontend and backend.

## 🎯 Purpose

This project was built to **strengthen core web development skills** without relying on frameworks. The goal was to understand what happens "under the hood" — from DOM manipulation on the frontend to HTTP servers and file I/O on the backend.

## 🛠️ Tech Stack

### Frontend

- **HTML5** — semantic markup
- **CSS3** — Flexbox, Grid, custom properties, media queries, animations
- **Vanilla JavaScript** — DOM manipulation, `fetch`, async/await, event delegation

### Backend

- **Node.js** — pure `http` module, no Express
- **File system** — `fs` for reading/writing JSON
- **REST API** — GET, POST, PUT, DELETE

## ✨ Features

### Core

- ✅ **CRUD** — create, read, update, delete recipes
- ✅ **REST API** — `/api/recipes` with full CRUD endpoints
- ✅ **Server-side validation** — required fields, valid categories
- ✅ **Client-side error display** — validation errors shown in form

### UI / UX

- ✅ **Responsive design** — mobile-first, media queries
- ✅ **Search** — filter by title and description (debounced)
- ✅ **Category filters** — breakfast, lunch, dinner, dessert
- ✅ **Modal** — recipe details with smooth open/close animations
- ✅ **Form modal** — add / edit recipe with validation
- ✅ **Empty state** — "No recipes found" message

### Advanced

- ✅ **Accessibility** — `aria-*`, `role="alert"`, focus management, keyboard support
- ✅ **localStorage** — persist filter selection across reloads
- ✅ **Event delegation** — one handler for all cards
- ✅ **Image fallback** — `onerror` for broken images
- ✅ **Body scroll lock** — when modal is open
- ✅ **Animations** — CSS transitions, `@keyframes`

## 📂 Project Structure

```text
02-cookbook-vanilla/
├── index.html    # Main page
├── style.css     # All styles (organized by sections)
├── script.js     # Frontend logic
├── server.js     # Node.js server (static + API)
├── recipes.json  # Data storage (acts as database)
└── README.md     # Project documentation
```

## 🚀 How to Run

### Requirements

- Node.js (v18+)

## Steps

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd 02-cookbook-vanilla
   ```

2. **Start the server:**

   ```bash
   node server.js
   ```

3. **Open in browser:**

   http://localhost:3000
