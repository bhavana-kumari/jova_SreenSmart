# ScreenSmart

AI Resume Screening & Interview Scheduling Copilot

```
backend_res/
├── backend/     ← Node.js + Express + Gemini + n8n
└── frontend/    ← React + Tailwind + Axios
```

## Run

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm start
```
Runs on http://localhost:4000

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173  
Vite proxies `/api` → backend port 4000.

## Env (backend)

Copy `backend/.env.example` → `backend/.env` and set:

- `GEMINI_API_KEY`
- `N8N_WEBHOOK` (optional)
- `PORT` (default `4000`)
