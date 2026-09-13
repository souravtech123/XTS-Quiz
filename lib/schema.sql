-- XTS Quiz Platform — PostgreSQL Schema
-- Run via: npx tsx scripts/init-db.ts

-- Quiz configuration (single row)
CREATE TABLE IF NOT EXISTS quiz_config (
  id              SERIAL PRIMARY KEY,
  title           TEXT    NOT NULL DEFAULT 'XTS Tech Arena — Season 1',
  subtitle        TEXT    NOT NULL DEFAULT '',
  total_questions INT     NOT NULL DEFAULT 0,
  time_limit_mins INT     NOT NULL DEFAULT 10,
  status          TEXT    NOT NULL DEFAULT 'Draft'
                  CHECK (status IN ('Draft','Published','Live','Closed')),
  require_student_id BOOLEAN NOT NULL DEFAULT TRUE,
  require_phone      BOOLEAN NOT NULL DEFAULT TRUE
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id              TEXT    PRIMARY KEY,
  question        TEXT    NOT NULL,
  option_a        TEXT    NOT NULL,
  option_b        TEXT    NOT NULL,
  option_c        TEXT    NOT NULL,
  option_d        TEXT    NOT NULL,
  correct_answer  CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  marks           INT     NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id              TEXT    PRIMARY KEY,
  full_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  student_id      TEXT    NOT NULL DEFAULT '',
  phone           TEXT    NOT NULL DEFAULT '',
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  quiz_status     TEXT    NOT NULL DEFAULT 'Not Started'
                  CHECK (quiz_status IN ('Not Started','In Progress','Submitted')),
  start_time      TIMESTAMPTZ
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id                  TEXT    PRIMARY KEY,
  student_id          TEXT    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name        TEXT    NOT NULL,
  student_email       TEXT    NOT NULL,
  student_college_id  TEXT    NOT NULL DEFAULT '',
  answers             JSONB   NOT NULL DEFAULT '{}',
  score               INT     NOT NULL DEFAULT 0,
  total_marks         INT     NOT NULL DEFAULT 0,
  percentage          INT     NOT NULL DEFAULT 0,
  time_taken_seconds  INT     NOT NULL DEFAULT 0,
  formatted_time_taken TEXT   NOT NULL DEFAULT '00:00',
  start_time          TIMESTAMPTZ NOT NULL,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
