// ─────────────────────────────────────────────
//  NEXUS Backend  —  server.js
//  A simple Express REST API that talks to PostgreSQL
// ─────────────────────────────────────────────

const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────
app.use(cors());               // allow requests from the frontend container
app.use(express.json());       // parse JSON request bodies

// ── Database connection ───────────────────────
// These values come from environment variables set in docker-compose.yml
const pool = new Pool({
  host:     process.env.DB_HOST,      // e.g. "db"  (the service name in compose)
  port:     process.env.DB_PORT,      // e.g. 5432
  database: process.env.DB_NAME,      // e.g. "nexus"
  user:     process.env.DB_USER,      // e.g. "nexus_user"
  password: process.env.DB_PASSWORD,  // e.g. "nexus_pass"
});

// Helper — runs a query and returns rows
async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

// ── Health check ──────────────────────────────
// GET /health  →  just confirms the API is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NEXUS API is running' });
});

// ─────────────────────────────────────────────
//  DAILY LOGS
// ─────────────────────────────────────────────

// GET /api/logs  →  all daily logs
app.get('/api/logs', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM daily_logs ORDER BY log_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/:date  →  one log by date  (e.g. /api/logs/2026-03-20)
app.get('/api/logs/:date', async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM daily_logs WHERE log_date = $1',
      [req.params.date]
    );
    // Return the first row or null if nothing found
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs  →  create or update a log for a given date
// Uses INSERT ... ON CONFLICT to upsert (update if already exists)
app.post('/api/logs', async (req, res) => {
  const { log_date, mood, did_today, notes } = req.body;
  try {
    const rows = await query(
      `INSERT INTO daily_logs (log_date, mood, did_today, notes, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (log_date)
       DO UPDATE SET mood       = EXCLUDED.mood,
                     did_today  = EXCLUDED.did_today,
                     notes      = EXCLUDED.notes,
                     updated_at = NOW()
       RETURNING *`,
      [log_date, mood, did_today, notes]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  HABITS
// ─────────────────────────────────────────────

// GET /api/habits  →  all habits
app.get('/api/habits', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM habits ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits  →  create a new habit
app.post('/api/habits', async (req, res) => {
  const { name } = req.body;
  try {
    const rows = await query(
      'INSERT INTO habits (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id  →  delete a habit (cascade deletes its logs too)
app.delete('/api/habits/:id', async (req, res) => {
  try {
    await query('DELETE FROM habits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/habit-logs/:date  →  all habit completions for a date
app.get('/api/habit-logs/:date', async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM habit_logs WHERE log_date = $1',
      [req.params.date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habit-logs  →  toggle a habit done/undone for a date
app.post('/api/habit-logs', async (req, res) => {
  const { habit_id, log_date, done } = req.body;
  try {
    const rows = await query(
      `INSERT INTO habit_logs (habit_id, log_date, done)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, log_date)
       DO UPDATE SET done = EXCLUDED.done
       RETURNING *`,
      [habit_id, log_date, done]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GOALS
// ─────────────────────────────────────────────

// GET /api/goals  →  all goals
app.get('/api/goals', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM goals ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals  →  create a new goal
app.post('/api/goals', async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const rows = await query(
      'INSERT INTO goals (title, description, priority) VALUES ($1, $2, $3) RETURNING *',
      [title, description, priority || 'medium']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/goals/:id  →  update status (active / completed)
app.patch('/api/goals/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const rows = await query(
      'UPDATE goals SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id  →  delete a goal
app.delete('/api/goals/:id', async (req, res) => {
  try {
    await query('DELETE FROM goals WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`NEXUS API running on port ${PORT}`);
});
