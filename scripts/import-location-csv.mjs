import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node scripts/import-location-csv.mjs <path-to-csv>');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'backend', 'bir_forms.db');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value);
  return values.map((item) => item.trim());
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines.shift() ?? '').map((header) => header.trim());

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

try {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'))
    .filter((row) => row.mun_code && row.mun && row.rdo_code);

  await run(`CREATE TABLE IF NOT EXISTS location (
    mun_code TEXT PRIMARY KEY,
    mun TEXT NOT NULL,
    rdo_code TEXT NOT NULL,
    zip_code TEXT
  )`);

  const columns = await all("PRAGMA table_info(location)");
  if (!columns.some((column) => column.name === 'zip_code')) {
    await run('ALTER TABLE location ADD COLUMN zip_code TEXT');
  }

  await run('BEGIN');
  try {
    for (const row of rows) {
      await run(
        `INSERT INTO location (mun_code, mun, rdo_code, zip_code)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(mun_code) DO UPDATE SET
           mun = excluded.mun,
           rdo_code = excluded.rdo_code,
           zip_code = excluded.zip_code`,
        [row.mun_code, row.mun, row.rdo_code, row.zip_code || null],
      );
    }
    await run('COMMIT');
  } catch (err) {
    await run('ROLLBACK');
    throw err;
  }

  const total = await all('SELECT COUNT(*) AS total FROM location');
  console.log(`Imported ${rows.length} CSV rows into location.`);
  console.log(`Location table now has ${total[0]?.total ?? 0} rows.`);
} finally {
  await close();
}
