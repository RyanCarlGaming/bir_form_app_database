import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database(path.join(__dirname, 'bir_forms.db'));

db.serialize(() => {
  db.all("SELECT mun_code, mun, rdo_code, zip_code FROM location WHERE mun_code IN ('000000000','0') OR rdo_code='000' OR mun='Unknown' ORDER BY mun_code", (err, locations) => {
    if (err) throw err;
    console.log('INVALID_LOCATIONS', locations);
    db.all("SELECT t.applicant_id, t.taxpayer_fullname, t.full_address, t.mun_code, l.mun AS location_mun, l.rdo_code, l.zip_code FROM taxpayer t LEFT JOIN location l ON l.mun_code=t.mun_code WHERE t.mun_code IN ('000000000','0') OR t.mun_code IS NULL OR t.mun_code IN (SELECT mun_code FROM location WHERE rdo_code='000' OR mun='Unknown') ORDER BY t.applicant_id DESC LIMIT 100", (err2, taxpayers) => {
      if (err2) throw err2;
      console.log('TAXPAYERS_WITH_INVALID_LOCATION', taxpayers);
      db.all("SELECT e.emp_tin, e.emp_fullname, e.emp_mun_code, l.mun AS location_mun, l.rdo_code, l.zip_code FROM employer e LEFT JOIN location l ON l.mun_code=e.emp_mun_code WHERE e.emp_mun_code IN ('000000000','0') OR e.emp_mun_code IN (SELECT mun_code FROM location WHERE rdo_code='000' OR mun='Unknown') ORDER BY e.emp_tin", (err3, employers) => {
        if (err3) throw err3;
        console.log('EMPLOYERS_WITH_INVALID_LOCATION', employers);
        db.close();
      });
    });
  });
});
