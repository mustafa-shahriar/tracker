# 📡 Torrent Tracker

A modern, full-stack torrent tracker application built with TypeScript.

---

## 🧱 Tech Stack

### Frontend
- **Angular** + **TypeScript**
- Standalone client application

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **PostgreSQL** (via Docker)
- **Redis** (via Docker)
- **MinIO** (S3-compatible object storage via Docker)
- **Drizzle ORM**

---

## 📁 Project Structure

```bash
.
├── frontend/          # Angular application
└── backend/           # Express server + Docker setup + dev scripts
```

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+ recommended)
- Docker & Docker Compose
- `tmux` (optional, for full dev mode)

---

### Option 1: Manual Setup (Recommended for most users)

#### 1. Start Infrastructure (Docker)
```bash
cd backend
npx drizzle-kit migrate
docker compose up -d
```

This starts:
- PostgreSQL
- Redis
- MinIO

#### 2. Start Backend Server
```bash
cd backend
npm run dev
```

#### 3. Start Frontend
```bash
cd frontend
npm run dev
```

---

### Option 2: Full Backend Dev Mode (One-command experience)

Inside the `backend/` directory, run:

```bash
./run.sh
```

This script uses **tmux** to create an organized development environment with:

- `docker` pane → `docker compose up`
- `app` pane → Backend server (`npm run dev`)
- `drizzle` pane → Drizzle Studio (database UI)

---

## ⚡ Quick Start Summary

```bash
# Terminal 1 - Infrastructure
cd backend && docker compose up -d

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - Frontend
cd frontend && npm run dev
```

Or simply run `./run.sh` inside `backend/` for the full tmux experience.

---

## Additional Commands

- **Drizzle Studio** (Database UI):  
  `cd backend && npx drizzle-kit studio`

- **Stop Docker services**:  
  `cd backend && docker compose down`
