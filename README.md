# NEXUS — Personal Life OS

A containerized personal productivity web application built with Docker Compose.

## Architecture

```
Browser
  │
  ├── http://localhost:8080  →  Frontend (Nginx container)
  │                              serves HTML / CSS / JS
  │
  └── http://localhost:3000  →  Backend (Node.js container)
                                 REST API (Express)
                                   │
                                   └──  Database (PostgreSQL container)
                                        persistent data storage
```

## Tech Stack

| Layer    | Technology          | Container         |
|----------|---------------------|-------------------|
| Frontend | HTML + CSS + JS     | Nginx (alpine)    |
| Backend  | Node.js + Express   | node:18-slim      |
| Database | PostgreSQL 15       | postgres (alpine) |

## File Structure

```
nexus-docker/
│
├── docker-compose.yml        ← orchestrates all 3 containers
│
├── frontend/
│   ├── Dockerfile            ← builds the Nginx container
│   ├── nginx.conf            ← Nginx server config
│   └── index.html            ← the entire frontend app
│
├── backend/
│   ├── Dockerfile            ← builds the Node.js container
│   ├── package.json          ← Node dependencies (express, pg, cors)
│   └── server.js             ← REST API with all routes
│
└── database/
    └── init.sql              ← creates tables on first run
```

## How to Run

### Requirements
- Docker Desktop installed and running

### Start the app
```bash
docker compose up --build
```

### Open in browser
- App:  http://localhost:8080
- API:  http://localhost:3000/health

### Stop the app
```bash
docker compose down
```

### Stop and delete all data
```bash
docker compose down -v
```

## API Endpoints

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /health               | Health check                 |
| GET    | /api/logs             | Get all daily logs           |
| GET    | /api/logs/:date       | Get log for specific date    |
| POST   | /api/logs             | Create or update a log       |
| GET    | /api/habits           | Get all habits               |
| POST   | /api/habits           | Create a habit               |
| DELETE | /api/habits/:id       | Delete a habit               |
| GET    | /api/habit-logs/:date | Get habit completions        |
| POST   | /api/habit-logs       | Toggle habit done/undone     |
| GET    | /api/goals            | Get all goals                |
| POST   | /api/goals            | Create a goal                |
| PATCH  | /api/goals/:id        | Update goal status           |
| DELETE | /api/goals/:id        | Delete a goal                |

## Data Persistence

Data is stored in a Docker named volume `postgres_data`.  
It survives `docker compose down` and container restarts.  
Only `docker compose down -v` deletes it.


