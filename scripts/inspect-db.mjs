import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'backend', 'bir_forms.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

function runSql(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));
}

async function inspect() {
  try {
    const total = (await runSql('SELECT COUNT(*) AS total FROM form_submissions'))[0]?.total ?? 0;
    const companies = await runSql('SELECT companyName, COUNT(*) AS cnt FROM form_submissions GROUP BY companyName');
    const statuses = await runSql('SELECT status, COUNT(*) AS cnt FROM form_submissions GROUP BY status');
      const profile = await runSql('SELECT * FROM office_profiles WHERE id = 1');
    const sample = await runSql('SELECT id, taxpayerId, companyName, status, createdAt, updatedAt FROM form_submissions ORDER BY updatedAt DESC LIMIT 10');

    console.log('DB path:', dbPath);
    console.log('Total forms:', total);
    console.log('Company breakdown:');
    companies.forEach(r => console.log(`  "${r.companyName}" -> ${r.cnt}`));
    console.log('Status breakdown:');
    statuses.forEach(r => console.log(`  ${r.status} -> ${r.cnt}`));
      console.log('Office profile:');
      console.dir(profile[0] ?? null, { depth: null });
    console.log('Sample rows:');
    console.table(sample);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  } finally {
    db.close();
  }
}

inspect();
