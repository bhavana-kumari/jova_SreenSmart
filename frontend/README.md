# ScreenSmart Frontend

React UI for the ScreenSmart AI Resume Screening Copilot.

## Stack

- React + Vite
- Tailwind CSS v4
- React Router
- Axios
- React Icons
- Framer Motion

## Run

1. Start the **backend** (port 4000):
   ```bash
   cd ../backend
   npm start
   ```

2. Start the **frontend** (from this folder):
   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

Vite proxies `/api` → `http://localhost:4000` (no CORS changes needed on Express).

## Pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/upload` | JD + resume upload → `POST /api/screen` |
| `/dashboard` | Results, filters, candidate modal |
| `/about` | Product overview |
