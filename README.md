# Delivery Rider — Frontend

A React + TypeScript + Vite progressive web app for delivery riders.
Deployed on GitHub Pages at `https://<org>.github.io/delivery-man/`.

---

## Quick Start

```bash
npm install
cp .env.example .env   # VITE_MOCK=true is already set — no backend needed
npm run dev            # http://localhost:5173/delivery-man/
```

> **Note:** The app cannot be opened by double-clicking `index.html`.
> It requires the Vite dev server (`npm run dev`) to compile TypeScript and
> resolve imports.  Follow the steps above and open the URL printed in the
> terminal.

## Demo / Mock Mode (no backend required)

When `VITE_MOCK=true` is set in your `.env` file, the app runs entirely in
the browser — no real backend needed.

| Field | Demo value |
|-------|------------|
| Phone | any 10-digit number (e.g. `0801234567`) |
| OTP | `123456` |

After logging in and completing your profile you will see sample dispatches
pre-loaded on the Home and Dispatches screens.

Set `VITE_MOCK=false` (and configure `VITE_API_BASE_URL`) when you are ready
to connect the app to a real backend.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-module replacement |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

See [`.env.example`](.env.example) for all supported variables.

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (no trailing slash) |
| `VITE_MOCK` | Set to `true` to run without a backend (demo mode) |

## Deployment (GitHub Pages)

The app uses `base: '/delivery-man/'` in `vite.config.ts` and HashRouter so
all routes work correctly on GitHub Pages.

The [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) workflow
automatically builds and deploys on every push to `main`.
Set `VITE_API_BASE_URL` and `VITE_MOCK=false` as **repository secrets** in
_Settings → Secrets and variables → Actions_.

## Error Handling

A global **ErrorBoundary** wraps the entire app.  Any uncaught JavaScript
error, failed component render, or build-path issue will display a branded
error panel with a _Try Again_ button and reload option — never a blank white
screen.

- **API down / backend unreachable** — each page catches network errors and
  shows an inline error message with a retry button.
- **JS runtime error** — the nearest ErrorBoundary catches it, shows a
  helpful message, and lets the rider reload or retry.
- **Root element missing** — `main.tsx` renders a plain-HTML fallback before
  React even mounts.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| App doesn't open from `index.html` | Use `npm run dev` and open `http://localhost:5173/delivery-man/` |
| Blank page on load | Open DevTools → Console. Look for 404s on JS/CSS assets — the app must be served from `/delivery-man/`. |
| "Failed to send OTP" | Set `VITE_MOCK=true` in `.env` to bypass the backend, or check `VITE_API_BASE_URL`. |
| Login succeeds locally but not on Pages | Ensure `VITE_API_BASE_URL` secret is set in GitHub repository settings. |
| White screen after deploy | Hard-refresh (`Ctrl+Shift+R`) to clear old cached assets. |

