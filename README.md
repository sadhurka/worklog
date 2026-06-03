# 🏗 Construction Site Work Log

A full-stack web application for foremen to track daily construction site work — log what was done, by whom, how much, and when.

## Stack

| Layer      | Technology                     | Why                                                                                  |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Frontend   | React 18 + TypeScript + Vite   | Type-safe UI with fast HMR dev experience. Vite for instant builds.                  |
| Backend    | Node.js + Express + TypeScript | Lightweight, no-overhead REST API. Easy to read and extend.                          |
| Database   | MySQL 8.0                      | Relational data fits work entries well. Mature, widely supported, great with Docker. |
| DB driver  | mysql2                         | Fast, promise-based, no ORM overhead for a simple CRUD app.                          |
| Validation | express-validator              | Declarative per-field validation on the API layer.                                   |
| Styling    | Vanilla CSS                    | Zero dependencies, full control, industrial/dark aesthetic.                          |
| Container  | Docker + docker-compose        | One-command startup, isolated services, persistent MySQL volume.                     |

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

### Option B — Local development

**Prerequisites:** Node.js 20+, MySQL 8 running locally.

1. **Create a MySQL database:**

```sql
CREATE DATABASE worklog_db;
CREATE USER 'worklog_user'@'localhost' IDENTIFIED BY 'worklog_pass';
GRANT ALL PRIVILEGES ON worklog_db.* TO 'worklog_user'@'localhost';
```

2. **Start the backend:**

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

3. **Start the frontend:**

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

> In local dev mode the Vite dev server proxies `/api` to `http://localhost:4000`.

---

---

## Environment

- Copy `.env.sample` to `.env` at the repository root and fill in real credentials.

- Example `.env.sample` (safe placeholders):

```env
MYSQL_ROOT_PASSWORD=CHANGEME
MYSQL_DATABASE=worklog_db
MYSQL_USER=worklog_user
MYSQL_PASSWORD=CHANGEME
PORT=4000
```

- Notes:
  - The repo's `docker-compose.yml` reads variables from the repo-root `.env` automatically when you use `docker-compose up`.
  - The backend loads environment variables via `dotenv` in local development, so running `npm run dev` inside `backend/` will pick up `.env` values.
 
- Create your local `.env` from the sample:

```bash
cp .env.sample .env
# edit .env and replace CHANGEME values with real credentials
```

- Security: `.env` is listed in `.gitignore` and should never be committed. If you accidentally pushed secrets, rotate them immediately and remove the file from git history.

## API Endpoints

| Method   | Path                    | Description                                   |
| -------- | ----------------------- | --------------------------------------------- |
| `GET`    | `/api/work-entries`     | List all entries. Supports `?from=&to=&sort=` |
| `POST`   | `/api/work-entries`     | Create a new entry                            |
| `PUT`    | `/api/work-entries/:id` | Update an existing entry                      |
| `DELETE` | `/api/work-entries/:id` | Delete an entry                               |
| `GET`    | `/api/work-types`       | List all work types                           |
| `GET`    | `/api/health`           | Health check                                  |

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

| Field     | Rule                                     |
| --------- | ---------------------------------------- |
| Date      | Required. Cannot be in the future.       |
| Work type | Required. Min 2 characters.              |
| Volume    | Required. Must be > 0. Up to 2 decimals. |
| Unit      | Required.                                |
| Performer | Required. Min 3 characters.              |

Validation runs on both the frontend (instant feedback) and the backend (API-level guarantee).
