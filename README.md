# OpenVC — AI Venture Intelligence & Sourcing Platform

An AI-powered multi-agent platform for venture capital research, startup due diligence, and investment memo generation.

## Project Structure

```
upvotevc/
├── frontend/          ← React + Vite (UI)
│   ├── src/           ← Components, pages, context, lib
│   ├── public/        ← Static assets (favicon, icons)
│   ├── index.html     ← Vite entry point
│   ├── vite.config.js ← Vite configuration
│   └── package.json   ← Node dependencies
│
├── backend/           ← FastAPI + Python (API & AI Agents)
│   ├── main.py        ← FastAPI entry point
│   ├── api/           ← Vercel serverless wrapper
│   ├── agents/        ← AI agent workers (pain, market, finance, etc.)
│   ├── core/          ← Shared modules (LLM, schema, Supabase, history)
│   ├── orchestrator/  ← Multi-agent pipeline orchestrator
│   ├── tests/         ← Python test scripts
│   └── requirements.txt
│
├── .env.example       ← Environment variable template
├── vercel.json        ← Vercel deployment configuration
└── DESIGN-figma.md    ← Design reference document
```

## Getting Started

### Prerequisites

- **Node.js** (v18+) and **npm**
- **Python** (3.10+) and **pip**
- API keys (see `.env.example`)

### 1. Setup Environment Variables

```bash
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API runs at `http://localhost:8000` by default.

### 4. Development

Run both servers simultaneously:
- Frontend dev server: `cd frontend && npm run dev`
- Backend API server: `cd backend && uvicorn main:app --reload`

The Vite dev server proxies `/api` requests to the backend automatically.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite 8, React Router 7  |
| Backend   | FastAPI, Python 3.10+              |
| Database  | Supabase (PostgreSQL)              |
| AI/LLM    | OpenAI-compatible API (Grok/GPT)   |
| Deploy    | Vercel (Serverless)                |
