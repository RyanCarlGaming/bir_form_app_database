import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = new sqlite3.Database(join(__dirname, '..', 'backend', 'bir_forms.db'));

db.get('SELECT COUNT(*) AS total FROM location', (e, r) => console.log('Total rows:', r.total));
db.all(
  "SELECT * FROM location WHERE mun_code IN ('042101','042107','042110','137612','137613') ORDER BY mun_code",
  (e, rows) => { rows.forEach((r) => console.log(r)); db.close(); },
);
