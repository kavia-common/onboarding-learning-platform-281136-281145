-- Enable uuid-ossp extension for UUID generation if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  content_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Acknowledgements of documents by users
CREATE TABLE IF NOT EXISTS acknowledgements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  document_key TEXT REFERENCES documents(key) ON DELETE CASCADE,
  signature_name TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ack_user ON acknowledgements(user_id);
CREATE INDEX IF NOT EXISTS idx_ack_doc ON acknowledgements(document_key);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modules
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content_url TEXT,
  order_index INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enroll_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enroll_course ON enrollments(course_id);

-- Progress on modules
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  score NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON progress(module_id);
