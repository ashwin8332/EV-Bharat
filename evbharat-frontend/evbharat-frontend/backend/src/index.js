import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const jwtSecret = process.env.JWT_SECRET || 'change-me';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const dbPath = process.env.DB_PATH || './data/evbharat.sqlite';

const db = await open({
  filename: dbPath,
  driver: sqlite3.Database
});

// Enable foreign keys
await db.exec('PRAGMA foreign_keys = ON;');

// ── Create all tables ──────────────────────────────────
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE TABLE IF NOT EXISTS user_vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    battery_capacity REAL,
    range_km REAL,
    charging_types TEXT,
    notes TEXT,
    is_primary INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function toUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role
  };
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'owner']
    );

    const user = {
      id: String(result.lastID),
      name,
      email,
      role: 'owner'
    };

    const token = createToken(user);
    return res.status(201).json({ success: true, message: 'Account created.', user, token });
  } catch (error) {
    if (error?.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  try {
    const userRow = await db.get(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (!userRow) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, userRow.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = toUser(userRow);
    const token = createToken(user);

    return res.json({ success: true, message: 'Login successful.', user, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── Google Maps API key endpoint ──
app.get('/api/maps/key', (_req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(500).json({ success: false, message: 'Maps API key not configured.' });
  }
  return res.json({ key });
});

// ── JWT Auth Middleware ──
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);
    req.userId = Number(payload.sub);
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// ── GET /api/profile – fetch full profile ──
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const profile = await db.get('SELECT * FROM user_profiles WHERE user_id = ?', [req.userId]);
    const preferences = await db.get('SELECT * FROM user_preferences WHERE user_id = ?', [req.userId]);
    const vehicle = await db.get('SELECT * FROM user_vehicles WHERE user_id = ? AND is_primary = 1', [req.userId]);

    return res.json({
      success: true,
      data: {
        user: { id: String(user.id), name: user.name, email: user.email, role: user.role, createdAt: user.created_at },
        profile: profile || {},
        preferences: preferences ? {
          emailNotifications: !!preferences.email_notifications,
          batteryAlerts: !!preferences.battery_alerts,
          maintenanceAlerts: !!preferences.maintenance_alerts,
          distanceUnit: preferences.distance_unit,
          temperatureUnit: preferences.temperature_unit,
          language: preferences.language,
          twoFactorEnabled: !!preferences.two_factor_enabled
        } : null,
        vehicle: vehicle ? {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          batteryCapacity: vehicle.battery_capacity,
          rangeKm: vehicle.range_km,
          chargingTypes: vehicle.charging_types ? vehicle.charging_types.split(',') : [],
          notes: vehicle.notes
        } : null
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/profile/personal – update name, email, phone, address etc. ──
app.put('/api/profile/personal', authenticate, async (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, address, city, state } = req.body ?? {};

  if (!firstName || !lastName) {
    return res.status(400).json({ success: false, message: 'First and last name are required.' });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  try {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Update users table (name & email)
    if (email) {
      const existing = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.userId]);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email is already in use.' });
      }
      await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [fullName, email, req.userId]);
    } else {
      await db.run('UPDATE users SET name = ? WHERE id = ?', [fullName, req.userId]);
    }

    // Upsert user_profiles
    const existingProfile = await db.get('SELECT id FROM user_profiles WHERE user_id = ?', [req.userId]);
    if (existingProfile) {
      await db.run(
        `UPDATE user_profiles SET phone = ?, date_of_birth = ?, address = ?, city = ?, state = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [phone || null, dateOfBirth || null, address || null, city || null, state || null, req.userId]
      );
    } else {
      await db.run(
        `INSERT INTO user_profiles (user_id, phone, date_of_birth, address, city, state) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.userId, phone || null, dateOfBirth || null, address || null, city || null, state || null]
      );
    }

    // Return updated user for localStorage sync
    const updatedUser = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.userId]);
    const token = createToken(toUser(updatedUser));

    return res.json({
      success: true,
      message: 'Personal information updated.',
      user: toUser(updatedUser),
      token
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/profile/password – change password ──
app.put('/api/profile/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }

  try {
    const userRow = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    if (!userRow) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.userId]);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/profile/preferences – update notification/units/language settings ──
app.put('/api/profile/preferences', authenticate, async (req, res) => {
  const { emailNotifications, batteryAlerts, maintenanceAlerts, distanceUnit, temperatureUnit, language, twoFactorEnabled } = req.body ?? {};

  try {
    const existing = await db.get('SELECT id FROM user_preferences WHERE user_id = ?', [req.userId]);
    if (existing) {
      await db.run(
        `UPDATE user_preferences SET
          email_notifications = ?, battery_alerts = ?, maintenance_alerts = ?,
          distance_unit = ?, temperature_unit = ?, language = ?, two_factor_enabled = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          emailNotifications ? 1 : 0, batteryAlerts ? 1 : 0, maintenanceAlerts ? 1 : 0,
          distanceUnit || 'km', temperatureUnit || 'celsius', language || 'en', twoFactorEnabled ? 1 : 0,
          req.userId
        ]
      );
    } else {
      await db.run(
        `INSERT INTO user_preferences (user_id, email_notifications, battery_alerts, maintenance_alerts, distance_unit, temperature_unit, language, two_factor_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.userId,
          emailNotifications ? 1 : 0, batteryAlerts ? 1 : 0, maintenanceAlerts ? 1 : 0,
          distanceUnit || 'km', temperatureUnit || 'celsius', language || 'en', twoFactorEnabled ? 1 : 0
        ]
      );
    }

    return res.json({ success: true, message: 'Preferences saved.' });
  } catch (error) {
    console.error('Preferences update error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/profile/vehicle – save/update vehicle info ──
app.put('/api/profile/vehicle', authenticate, async (req, res) => {
  const { make, model, year, batteryCapacity, rangeKm, chargingTypes, notes } = req.body ?? {};

  try {
    const chargingStr = Array.isArray(chargingTypes) ? chargingTypes.join(',') : (chargingTypes || '');
    const existing = await db.get('SELECT id FROM user_vehicles WHERE user_id = ? AND is_primary = 1', [req.userId]);

    if (existing) {
      await db.run(
        `UPDATE user_vehicles SET make = ?, model = ?, year = ?, battery_capacity = ?, range_km = ?, charging_types = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND is_primary = 1`,
        [make || null, model || null, year || null, batteryCapacity || null, rangeKm || null, chargingStr, notes || null, req.userId]
      );
    } else {
      await db.run(
        `INSERT INTO user_vehicles (user_id, make, model, year, battery_capacity, range_km, charging_types, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, make || null, model || null, year || null, batteryCapacity || null, rangeKm || null, chargingStr, notes || null]
      );
    }

    return res.json({ success: true, message: 'Vehicle information saved.' });
  } catch (error) {
    console.error('Vehicle update error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/contact – save contact form submissions ──
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  try {
    await db.run(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, message]
    );
    return res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact save error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Server error.' });
});

app.listen(port, () => {
  console.log(`Auth API running on port ${port}`);
});
