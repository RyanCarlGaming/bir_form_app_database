import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database(path.join(__dirname, 'sign-in.db'));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    userId INTEGER PRIMARY KEY,
    officerName TEXT NOT NULL,
    companyName TEXT NOT NULL DEFAULT 'Default Company',
    role TEXT NOT NULL,
    region TEXT NOT NULL,
    office TEXT NOT NULL,
    gender TEXT,
    phone TEXT,
    email TEXT,
    street TEXT,
    barangay TEXT,
    city TEXT,
    province TEXT,
    zipCode TEXT,
    photoDataUrl TEXT,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

function nowIso() {
  return new Date().toISOString();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await run('INSERT INTO sessions (token, userId) VALUES (?, ?)', [token, userId]);
  return token;
}

function tokenFromRequest(req) {
  const header = req.get('authorization') || '';
  const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];
  return token || null;
}

export async function getUserFromRequest(req) {
  const token = tokenFromRequest(req);
  if (!token) return null;

  return get(
    `
      SELECT users.id, users.name, users.email
      FROM sessions
      JOIN users ON users.id = sessions.userId
      WHERE sessions.token = ?
    `,
    [token]
  );
}

async function ensureUserProfile(user) {
  const existing = await get('SELECT userId FROM user_profiles WHERE userId = ?', [user.id]);
  if (existing) return;

  await run(
    `
      INSERT INTO user_profiles (
        userId, officerName, companyName, role, region, office, phone, email, street, barangay,
        city, province, zipCode, gender, photoDataUrl, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user.id,
      user.name,
      'Default Company',
      'Revenue Officer',
      '',
      '',
      '',
      user.email,
      '',
      '',
      '',
      '',
      '',
      'male',
      '',
      nowIso(),
    ]
  );
}

function profileRow(row) {
  return {
    id: row.userId,
    officerName: row.officerName,
    companyName: row.companyName,
    role: row.role,
    region: row.region,
    office: row.office,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    street: row.street,
    barangay: row.barangay,
    city: row.city,
    province: row.province,
    zipCode: row.zipCode,
    photoDataUrl: row.photoDataUrl,
    updatedAt: row.updatedAt,
  };
}

export async function getProfileForUser(user) {
  await ensureUserProfile(user);
  const profile = await get('SELECT * FROM user_profiles WHERE userId = ?', [user.id]);
  return profileRow(profile);
}

export async function updateProfileForUser(user, input) {
  await ensureUserProfile(user);

  const allowed = [
    'officerName',
    'companyName',
    'role',
    'region',
    'office',
    'phone',
    'email',
    'street',
    'barangay',
    'city',
    'province',
    'zipCode',
    'gender',
    'photoDataUrl',
  ];
  const entries = allowed
    .filter((key) => input[key] !== undefined)
    .map((key) => [key, input[key] ?? '']);

  if (entries.length) {
    const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(nowIso(), user.id);
    await run(`UPDATE user_profiles SET ${assignments}, updatedAt = ? WHERE userId = ?`, values);
  }

  return getProfileForUser(user);
}

export async function deleteUserAccount(user) {
  await run('DELETE FROM sessions WHERE userId = ?', [user.id]);
  await run('DELETE FROM user_profiles WHERE userId = ?', [user.id]);
  const result = await run('DELETE FROM users WHERE id = ?', [user.id]);
  return result.changes > 0;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await get(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existing) {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await run(
      `
        INSERT INTO users (
          name,
          email,
          password
        )
        VALUES (?, ?, ?)
      `,
      [name.trim(), normalizedEmail, hashed]
    );

    const user = {
      id: result.lastID,
      name: name.trim(),
      email: normalizedEmail,
    };
    await ensureUserProfile(user);
    const token = await createSession(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await get(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = await createSession(user.id);
    await ensureUserProfile(user);

    return res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

router.delete('/account', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    await deleteUserAccount(user);

    return res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;
