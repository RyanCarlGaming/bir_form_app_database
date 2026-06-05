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

function run(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    }),
  );
}

const locations = [
  // NCR
  ['137601', 'Antipolo', '45', '1870'],
  ['137602', 'Cainta', '45', '1900'],
  ['137603', 'Taytay', '45', '1920'],
  ['137604', 'Binangonan', '45', '1940'],
  ['137605', 'Pateros', '43', '1620'],
  ['137606', 'Makati', '47', '1200'],
  ['137607', 'Quezon City', '38', '1100'],
  ['137608', 'Manila', '33', '1000'],
  ['137609', 'Pasig', '43', '1600'],
  ['137610', 'Taguig', '44', '1630'],
  ['137611', 'Caloocan', '27', '1400'],
  ['137612', 'Las Piñas', '52', '1740'],
  ['137613', 'Parañaque', '52', '1700'],
  ['137614', 'Valenzuela', '24', '1440'],
  ['137615', 'Malabon', '26', '1470'],
  ['137616', 'Mandaluyong', '41', '1550'],
  ['137617', 'Marikina', '42', '1800'],
  ['137618', 'Muntinlupa', '53', '1770'],
  ['137619', 'Navotas', '26', '1485'],
  ['137620', 'San Juan', '41', '1500'],
  // Cavite
  ['042101', 'Dasmariñas', '54', '4114'],
  ['042102', 'Bacoor', '54', '4102'],
  ['042103', 'Imus', '54', '4103'],
  ['042104', 'Tagaytay', '54', '4120'],
  ['042105', 'Silang', '54', '4118'],
  ['042106', 'Calamba', '56', '4027'],
  ['042107', 'Biñan', '57', '4024'],
  ['042108', 'Santa Rosa', '57', '4026'],
  ['042109', 'San Pedro', '57', '4023'],
  ['042110', 'Los Baños', '56', '4030'],
  ['042111', 'Cabuyao', '57', '4025'],
  ['042112', 'Noveleta', '54', '4105'],
  ['042113', 'Kawit', '54', '4104'],
  ['042114', 'Rosario', '54', '4106'],
  ['042115', 'Naic', '54', '4110'],
  // Bulacan
  ['031401', 'Malolos', '25', '3000'],
  ['031402', 'Meycauayan', '25', '3020'],
  ['031403', 'Marilao', '25', '3019'],
  ['031404', 'Bocaue', '25', '3018'],
  // Baguio / Ilocos
  ['014401', 'Baguio', '8', '2600'],
  ['011401', 'Laoag', '1', '2900'],
  ['012801', 'Vigan', '2', '2700'],
  ['015501', 'San Fernando (La Union)', '3', '2500'],
  // Pangasinan
  ['013301', 'Dagupan', '4', '2400'],
  ['013302', 'Lingayen', '4', '2401'],
  // Pampanga / Zambales
  ['035401', 'Angeles', '21', '2009'],
  ['035402', 'San Fernando (Pampanga)', '21', '2000'],
  ['035403', 'Mabalacat', '21', '2010'],
  ['031801', 'Olongapo', '19', '2200'],
  ['031802', 'Subic', '19', '2201'],
  ['030201', 'Balanga', '20', '2100'],
  ['034901', 'Tarlac City', '17', '2300'],
  // Nueva Ecija / Isabela
  ['035001', 'Cabanatuan', '23', '3100'],
  ['023101', 'Santiago', '12', '3311'],
  ['020901', 'Tuguegarao', '13', '3500'],
  // Batangas / Quezon / Camarines
  ['041301', 'Batangas City', '58', '4200'],
  ['041302', 'Lipa', '59', '4217'],
  ['045601', 'Lucena', '60', '4301'],
  ['054601', 'Naga', '65', '4400'],
  ['050201', 'Legazpi', '67', '4500'],
  ['050901', 'Sorsogon City', '69', '4700'],
  // Palawan
  ['175801', 'Puerto Princesa', '36', '5300'],
  // Cebu
  ['072201', 'Cebu City', '81', '6000'],
  ['072202', 'Mandaue', '80', '6014'],
  ['072203', 'Lapu-Lapu', '80', '6015'],
  ['072204', 'Talisay', '83', '6045'],
  ['072205', 'Consolacion', '80', '6001'],
  ['072206', 'Liloan', '80', '6002'],
  ['072207', 'Minglanilla', '83', '6046'],
  // Iloilo / Bacolod / Negros
  ['063001', 'Iloilo City', '74', '5000'],
  ['064501', 'Bacolod', '77', '6100'],
  ['074601', 'Dumaguete', '79', '6200'],
  // Leyte / Bohol / Capiz / Aklan
  ['083701', 'Tacloban', '88', '6500'],
  ['083702', 'Ormoc', '89', '6541'],
  ['071201', 'Tagbilaran', '84', '6300'],
  ['060601', 'Roxas City', '72', '5800'],
  ['060501', 'Kalibo', '71', '5600'],
  // Davao
  ['112401', 'Davao City', '113', '8000'],
  ['112402', 'Tagum', '112', '8100'],
  ['112403', 'Digos', '115', '8002'],
  ['112404', 'Mati', '112', '8200'],
  // Mindanao
  ['102801', 'Cagayan de Oro', '98', '9000'],
  ['097201', 'Zamboanga City', '93', '7000'],
  ['124701', 'General Santos', '110', '9500'],
  ['123301', 'Iligan', '101', '9200'],
  ['160201', 'Butuan', '103', '8600'],
  ['124501', 'Cotabato City', '107', '9600'],
  ['124502', 'Koronadal', '111', '9506'],
  ['166701', 'Surigao City', '106', '8400'],
  ['101501', 'Malaybalay', '99', '8700'],
  ['101502', 'Valencia', '99', '8709'],
  ['097203', 'Pagadian', '93', '7016'],
  ['097101', 'Dipolog', '91', '7100'],
  ['098501', 'Ozamiz', '100', '7200'],
  ['153601', 'Marawi', '102', '9700'],
  ['124801', 'Kidapawan', '108', '9400'],
  ['124901', 'Tacurong', '109', '9800'],
  ['097204', 'Isabela City', '93', '7300'],
  ['153701', 'Jolo', '114', '7400'],
  ['153801', 'Bongao', '114', '7500'],
];

async function seed() {
  let inserted = 0;
  let updated = 0;

  for (const [mun_code, mun, rdo_code, zip_code] of locations) {
    const before = await new Promise((resolve, reject) =>
      db.get('SELECT mun FROM location WHERE mun_code = ?', [mun_code], (err, row) =>
        err ? reject(err) : resolve(row),
      ),
    );

    const result = await run(
      `INSERT INTO location (mun_code, mun, rdo_code, zip_code)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(mun_code) DO UPDATE SET
         mun      = excluded.mun,
         rdo_code = excluded.rdo_code,
         zip_code = excluded.zip_code`,
      [mun_code, mun, rdo_code, zip_code],
    );

    if (!before) inserted++;
    else if (result.changes > 0) updated++;
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Unchanged: ${locations.length - inserted - updated}`);
}

seed()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => db.close());
