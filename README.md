# 🏗 Construction Site Work Log

A full-stack web application for foremen to track daily construction site work — log what was done, by whom, how much, and when.

---

## Stack

| Layer      | Technology         | Why                                                                                     |
| ---------- | ------------------ | --------------------------------------------------------------------------------------- |
| Frontend   | React 18 + TypeScript + Vite | Type-safe UI with fast HMR dev experience. Vite for instant builds.         |
| Backend    | Node.js + Express + TypeScript | Lightweight, no-overhead REST API. Easy to read and extend.              |
| Database   | MySQL 8.0          | Relational data fits work entries well. Mature, widely supported, great with Docker.    |
| DB driver  | mysql2             | Fast, promise-based, no ORM overhead for a simple CRUD app.                            |
| Validation | express-validator  | Declarative per-field validation on the API layer.                                     |
| Styling    | Vanilla CSS        | Zero dependencies, full control, industrial/dark aesthetic.                            |
| Container  | Docker + docker-compose | One-command startup, isolated services, persistent MySQL volume.                  |

---

## Features

- **List** all work log entries in a sortable, filterable table
- **Filter** by date range (from / to)
- **Sort** by date (newest or oldest first)
- **Add** entries via a validated form (date, work type, volume, unit, performer)
- **Edit** existing entries
- **Delete** entries with a confirmation step
- **Work type reference** — pre-seeded dropdown (15 default types, stored in DB)
- Data **persists** across container restarts via named Docker volume

---

## Quick Start

### Option A — Docker (recommended)

```bash
git clone <your-repo-url>
cd construction-worklog
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> MySQL data is stored in a named Docker volume (`mysql_data`) and survives restarts.

### Option B — Local development (without Docker)
 
**Prerequisites:** Node.js 20+, MySQL 8 running locally.
 
**1. Create the database and user** (values must match your `.env`):
 
```sql
CREATE DATABASE worklog_db;
CREATE USER 'worklog_user'@'localhost' IDENTIFIED BY 'worklog_pass';
GRANT ALL PRIVILEGES ON worklog_db.* TO 'worklog_user'@'localhost';
FLUSH PRIVILEGES;
```
 
**2. Copy `.env.sample` to `.env`:**
 
```bash
cp .env.sample .env
```
 
**3. Start the backend:**
 
```bash
cd backend
npm install
npm run dev
# API running at http://localhost:4000
```
 
**4. Start the frontend** (open a second terminal):
 
```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:5173
```
 
> For local dev, update the proxy target in `frontend/vite.config.ts`:
> ```ts
> target: 'http://localhost:4000',   // instead of http://backend:4000
> ```
 
---

## API Endpoints

| Method   | Path                      | Description                                 |
| -------- | ------------------------- | ------------------------------------------- |
| `GET`    | `/api/work-entries`       | List all entries. Supports `?from=&to=&sort=` |
| `POST`   | `/api/work-entries`       | Create a new entry                          |
| `PUT`    | `/api/work-entries/:id`   | Update an existing entry                    |
| `DELETE` | `/api/work-entries/:id`   | Delete an entry                             |
| `GET`    | `/api/work-types`         | List all work types                         |
| `GET`    | `/api/health`             | Health check                                |

---

## Database Schema

```sql
CREATE TABLE work_types (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE work_entries (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  date       DATE NOT NULL,
  work_type  VARCHAR(255) NOT NULL,
  volume     DECIMAL(10,2) NOT NULL,
  unit       VARCHAR(20) NOT NULL,
  performer  VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Form Validation Rules

| Field     | Rule                                          |
| --------- | --------------------------------------------- |
| Date      | Required. Cannot be in the future.            |
| Work type | Required. Min 2 characters.                   |
| Volume    | Required. Must be > 0. Up to 2 decimals.      |
| Unit      | Required.                                     |
| Performer | Required. Min 3 characters.                   |

Validation runs on both the frontend (instant feedback) and the backend (API-level guarantee).
