# NoCode Builder - Frontend Prototype

This is a frontend-only prototype of a no-code app builder inspired by platforms like Adalo.

## Files
- `index.html` — main page (SPA-like).
- `styles.css` — styles.
- `src/storage.js` — localStorage persistence and seeded admin.
- `src/auth.js` — simple auth modal logic.
- `src/db.js` — per-project simple DB UI.
- `src/editor.js` — project editor logic.
- `src/app.js` — app initialization and routing.
- `src/utils.js` — helper functions.

## How to run
1. Open `index.html` in your browser.
2. Or run a simple static server:
   - `python -m http.server 8000`
   - or `npx http-server`
3. Admin account is preseeded in `src/storage.js` as:
   - email: `nocodebuilder@hotmail.com`
   - password: `Nikolapro1!`
   > The UI does not show admin credentials.

## Notes
- Everything is stored in browser `localStorage`.
- Publish generates a `?share=...` query param that will render the project preview when opening that link on the same host.
- This is a demo/prototype — for production you'll need a backend to store published snapshots, real auth and payments, and proper security.
