-- ── Users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── User Profiles ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── User Preferences ────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  battery_alerts INTEGER NOT NULL DEFAULT 1,
  maintenance_alerts INTEGER NOT NULL DEFAULT 1,
  distance_unit TEXT NOT NULL DEFAULT 'km',
  temperature_unit TEXT NOT NULL DEFAULT 'celsius',
  language TEXT NOT NULL DEFAULT 'en',
  two_factor_enabled INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── User Vehicles ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  battery_capacity REAL,
  range_km REAL,
  charging_types TEXT,          -- comma-separated: type1,type2,ccs,chademo
  notes TEXT,
  is_primary INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Contact Submissions ─────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
