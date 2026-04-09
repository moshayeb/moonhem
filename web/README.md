# Moonhem web (Vite + React)

Frontend for the Moonhem project. **Repo structure and full setup** are described in the **[root README](../README.md)**.

## Commands (from this folder)

```bash
npm install
npm run dev      # development server
npm run build    # production bundle
npm run lint
```

The Vite dev server proxies `/api/*` to the FastAPI backend (see `vite.config.js`). With the default setup, the app calls `/api` so you do not need CORS for local dev.
