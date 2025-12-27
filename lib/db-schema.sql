-- SQLite schema for Bodegalisten

-- Create users table (for Clerk integration)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' DEFAULT 'user',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create maps table
CREATE TABLE IF NOT EXISTS maps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  friendly_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_image TEXT,
  background_image TEXT,
  logo TEXT,
  active INTEGER DEFAULT 1,
  pwa_enable INTEGER DEFAULT 1,
  language TEXT DEFAULT 'en',
  languages_enabled TEXT DEFAULT '{}',
  show_in_first_page INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create markers table (bars/restaurants)
CREATE TABLE IF NOT EXISTS markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  description TEXT,
  category TEXT,
  image TEXT,
  street TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  hours TEXT,
  published INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create map_settings table
CREATE TABLE IF NOT EXISTS map_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  map_id INTEGER NOT NULL UNIQUE REFERENCES maps(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en',
  auto_start INTEGER DEFAULT 1,
  show_list INTEGER DEFAULT 1,
  limit_list INTEGER DEFAULT -1,
  default_zoom INTEGER DEFAULT 0,
  selected_zoom INTEGER DEFAULT 18,
  duration_zoom INTEGER DEFAULT 300,
  density_color INTEGER DEFAULT 0,
  default_prefix TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_maps_code ON maps(code);
CREATE INDEX IF NOT EXISTS idx_maps_friendly_url ON maps(friendly_url);
CREATE INDEX IF NOT EXISTS idx_maps_active ON maps(active);
CREATE INDEX IF NOT EXISTS idx_markers_map_id ON markers(map_id);
CREATE INDEX IF NOT EXISTS idx_markers_user_id ON markers(user_id);
CREATE INDEX IF NOT EXISTS idx_markers_active ON markers(active);
CREATE INDEX IF NOT EXISTS idx_markers_published ON markers(published);
CREATE INDEX IF NOT EXISTS idx_markers_location ON markers(lat, lon);
