# Delivery Man – Web Frontend

A **mobile-first SPA** (Vite + React + TypeScript + MUI) for delivery riders, inspired by Blinkit/Zomato rider apps.  
Deployed on **GitHub Pages** at `https://drxpharmsam.github.io/delivery-man/`.

## Features

- 🔐 OTP-based login (phone → send OTP → verify)
- 📍 Browser geolocation gate (blocks usage if denied)
- 🟢 Online / Offline toggle with live status pill
- 📦 Dispatch feed with auto-polling (every 20 s while online)
- 📋 Dispatch detail drawer – items, address, call customer, status progression
- 🔔 Snackbar notifications for all actions
- 🚫 Graceful handling of missing backend endpoints

## Tech Stack

| Layer | Library |
|-------|---------|
| Bundler | Vite 5 |
| UI | React 18 + TypeScript 5 |
| Component lib | Material UI 6 |
| Routing | React Router 6 (HashRouter) |
| HTTP | Axios |

## Local Development

```bash
# 1. Clone
git clone https://github.com/drxpharmsam/delivery-man
cd delivery-man

# 2. Install dependencies
npm install

# 3. Copy env and edit if needed
cp .env.example .env

# 4. Start dev server
npm run dev
# → http://localhost:5173/delivery-man/
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://mediflow-backend-z29j.onrender.com` | Backend base URL (no trailing slash) |

Copy `.env.example` to `.env` and set your API base URL.

## Production Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the build locally
```

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy.yml` runs on every push to `main` and deploys the `dist/` folder to GitHub Pages automatically.

**Manual setup (one-time):**

1. Go to repository **Settings → Pages**.
2. Set **Source** to `GitHub Actions`.
3. (Optional) Add a `VITE_API_BASE_URL` secret under **Settings → Secrets and variables → Actions**.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify` | Verify OTP, receive token |
| POST | `/api/delivery/me` | Create/fetch delivery profile |
| PUT | `/api/delivery/me/status` | Toggle online/offline |
| GET | `/api/delivery/dispatch?assignedToDeliveryId={phone}` | List assigned dispatches |
| PUT | `/api/delivery/dispatch/{id}/status` | Update dispatch status |
| PUT | `/api/orders/{orderId}/status` | Fallback status update |
