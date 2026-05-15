-- NEXUS Database Schema
-- This file runs automatically when the PostgreSQL container starts for the first time.

CREATE TABLE IF NOT EXISTS daily_logs (
    id        SERIAL PRIMARY KEY,
    log_date  DATE        NOT NULL UNIQUE,  -- one entry per day
    mood      VARCHAR(20),
    did_today TEXT,
    notes     TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habits (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id         SERIAL PRIMARY KEY,
    habit_id   INT  NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date   DATE NOT NULL,
    done       BOOLEAN DEFAULT FALSE,
    UNIQUE(habit_id, log_date)             -- one check per habit per day
);

CREATE TABLE IF NOT EXISTS goals (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    priority    VARCHAR(10) DEFAULT 'medium', -- high / medium / low
    status      VARCHAR(20) DEFAULT 'active', -- active / completed
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
