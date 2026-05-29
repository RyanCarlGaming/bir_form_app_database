import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_DB_PATH = join(__dirname, 'bir_forms.db');
let activeDbPath = process.env.DB_PATH ?? DEFAULT_DB_PATH;

let db;

function ensureDb() {
  if (!db) throw new Error('Database has not been initialized');
  return db;
}

function run(sql, params = []) {
  const database = ensureDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const database = ensureDb();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  const database = ensureDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows ?? []);
    });
  });
}

function nowIso() {
  return new Date().toISOString();
}

function optional(value) {
  return value === undefined || value === null ? '' : value;
}

function optionalNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function hasColumn(tableName, columnName) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  return columns.some((column) => column.name === columnName);
}

async function ensureColumn(tableName, columnName, definition) {
  if (!(await hasColumn(tableName, columnName))) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function normalizeRdoCode(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value);
  return /^\d+$/.test(text) ? text.padStart(3, '0') : text;
}

function formRow(row) {
  if (!row) return null;
  return {
    ...row,
    formData: row.formData || undefined,
  };
}

function dependentRow(row) {
  return {
    ...row,
    isIncapacitated: Boolean(row.isIncapacitated),
  };
}

async function createTables() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS taxpayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tin TEXT NOT NULL,
      birRegDate TEXT NOT NULL,
      pcn TEXT,
      taxpayerType TEXT NOT NULL,
      fullName TEXT NOT NULL,
      gender TEXT NOT NULL,
      civilStatus TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL,
      placeOfBirth TEXT NOT NULL,
      citizenship TEXT NOT NULL,
      otherCitizenship TEXT,
      motherFullName TEXT NOT NULL,
      fatherFullName TEXT NOT NULL,
      fullAddress TEXT,
      addrUnit TEXT,
      addrBuilding TEXT,
      addrLot TEXT,
      addrStreet TEXT NOT NULL,
      addrSubdivision TEXT,
      addrBarangay TEXT,
      addrTownDistrict TEXT,
      addrCity TEXT NOT NULL,
      province TEXT,
      foreignAddress TEXT,
      foreignCountry TEXT,
      foreignPostalCode TEXT,
      munCode TEXT,
      landline TEXT,
      fax TEXT,
      mobile TEXT,
      email TEXT,
      taxType TEXT NOT NULL,
      formType TEXT NOT NULL,
      atc TEXT NOT NULL,
      idType TEXT NOT NULL,
      idNumber TEXT NOT NULL,
      idEffectivity TEXT,
      idExpiry TEXT,
      idIssuer TEXT,
      idPlace TEXT,
      rdoCode TEXT,
      zipCode TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS spouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taxpayerId INTEGER NOT NULL,
      spouseTin TEXT,
      spouseFullName TEXT NOT NULL,
      spouseEmployment TEXT,
      exemptionClaimant TEXT NOT NULL,
      FOREIGN KEY (taxpayerId) REFERENCES taxpayers(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taxpayerId INTEGER NOT NULL,
      employerTin TEXT NOT NULL,
      employerFullName TEXT NOT NULL,
      employerFullAddress TEXT NOT NULL,
      empLandline TEXT,
      munCode TEXT,
      employerZipCode TEXT,
      registeringOfficeType TEXT NOT NULL,
      employmentType TEXT NOT NULL,
      hireDate TEXT NOT NULL,
      FOREIGN KEY (taxpayerId) REFERENCES taxpayers(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS dependents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taxpayerId INTEGER NOT NULL,
      fullName TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL,
      isIncapacitated INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (taxpayerId) REFERENCES taxpayers(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taxpayerId INTEGER NOT NULL,
      formType TEXT NOT NULL,
      taxableYear INTEGER,
      taxablePeriod TEXT,
      grossIncome REAL,
      allowableDeductions REAL,
      taxableIncome REAL,
      taxDue REAL,
      taxWithheld REAL,
      taxPayable REAL,
      penaltiesAndInterest REAL,
      totalAmountDue REAL,
      status TEXT NOT NULL DEFAULT 'draft',
      companyName TEXT NOT NULL DEFAULT 'Default Company',
      filedDate TEXT,
      remarks TEXT,
      formData TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (taxpayerId) REFERENCES taxpayers(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS office_profiles (
      id INTEGER PRIMARY KEY CHECK (id = 1),
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
      updatedAt TEXT NOT NULL
    )
  `);

  await ensureColumn('form_submissions', 'companyName', "TEXT NOT NULL DEFAULT 'Default Company'");
  await ensureColumn('office_profiles', 'companyName', "TEXT NOT NULL DEFAULT 'Default Company'");
  await ensureColumn('office_profiles', 'gender', "TEXT");
  await ensureColumn('taxpayers', 'fullAddress', "TEXT");
  await ensureColumn('employers', 'employerZipCode', "TEXT");

  const profile = await get('SELECT id FROM office_profiles WHERE id = 1');
  if (!profile) {
    await run(
      `INSERT INTO office_profiles (
        id, officerName, companyName, role, region, office, phone, email, street, barangay,
        city, province, zipCode, gender, photoDataUrl, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'Daniel Flor',
        'Default Company',
        'Revenue Officer',
        'Revenue Region No. 7',
        'Quezon City',
        '',
        'daniel.flor@bir.gov.ph',
        '',
        '',
        'Quezon City',
        'Metro Manila',
        '',
        '',
        '',
        nowIso(),
      ],
    );
  }

  const currentProfile = await getProfile();
  await run(
    `UPDATE form_submissions
     SET companyName = ?
     WHERE companyName IS NULL OR companyName = ''`,
    [currentProfile?.companyName || 'Default Company'],
  );

  await run('CREATE INDEX IF NOT EXISTS idx_taxpayers_tin ON taxpayers(tin)');
  await run('CREATE INDEX IF NOT EXISTS idx_taxpayers_rdo ON taxpayers(rdoCode)');
  await run('CREATE INDEX IF NOT EXISTS idx_forms_taxpayer ON form_submissions(taxpayerId)');
  await run('CREATE INDEX IF NOT EXISTS idx_forms_status ON form_submissions(status)');
  await run('CREATE INDEX IF NOT EXISTS idx_forms_company ON form_submissions(companyName)');

  await run(`
    DELETE FROM taxpayers
    WHERE NOT EXISTS (
      SELECT 1
      FROM form_submissions
      WHERE form_submissions.taxpayerId = taxpayers.id
    )
  `);

  await run(`
    DELETE FROM form_submissions
    WHERE NOT EXISTS (
      SELECT 1
      FROM taxpayers
      WHERE taxpayers.id = form_submissions.taxpayerId
    )
  `);
}

function setupDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await createTables();
        resolve(dbPath);
      } catch (setupError) {
        reject(setupError);
      }
    });
  });
}

export async function initializeDatabase() {
  try {
    return await setupDatabase(activeDbPath);
  } catch (err) {
    if (err?.code !== 'SQLITE_CORRUPT' || process.env.DB_PATH) throw err;

    await closeDatabase().catch(() => {});
    activeDbPath = join(__dirname, 'bir_forms_dev.db');
    console.warn(`Default database is corrupt. Falling back to ${activeDbPath}`);
    return setupDatabase(activeDbPath);
  }
}

async function hydrateTaxpayer(row, includeForms = true) {
  if (!row) return null;

  const [spouse, employers, dependents] = await Promise.all([
    get('SELECT * FROM spouses WHERE taxpayerId = ?', [row.id]),
    all('SELECT * FROM employers WHERE taxpayerId = ? ORDER BY id ASC', [row.id]),
    all('SELECT * FROM dependents WHERE taxpayerId = ? ORDER BY id ASC', [row.id]),
  ]);

  const taxpayer = {
    ...row,
    spouse: spouse ?? undefined,
    employers,
    dependents: dependents.map(dependentRow),
  };

  if (includeForms) {
    const forms = await all(
      'SELECT * FROM form_submissions WHERE taxpayerId = ? ORDER BY updatedAt DESC, id DESC',
      [row.id],
    );
    taxpayer.formSubmissions = forms.map(formRow);
  }

  return taxpayer;
}

async function hydrateForm(row) {
  const form = formRow(row);
  if (!form) return null;

  const taxpayer = await get('SELECT * FROM taxpayers WHERE id = ?', [form.taxpayerId]);
  form.taxpayer = await hydrateTaxpayer(taxpayer, false);
  return form;
}

async function currentCompanyName() {
  const profile = await getProfile();
  return profile?.companyName || 'Default Company';
}

async function insertTaxpayer(input) {
  const timestamp = nowIso();
  const fields = {
    tin: optional(input.tin),
    birRegDate: optional(input.birRegDate),
    pcn: optional(input.pcn),
    taxpayerType: optional(input.taxpayerType || 'local'),
    fullName: optional(input.fullName),
    gender: optional(input.gender),
    civilStatus: optional(input.civilStatus),
    dateOfBirth: optional(input.dateOfBirth),
    placeOfBirth: optional(input.placeOfBirth),
    citizenship: optional(input.citizenship),
    otherCitizenship: optional(input.otherCitizenship),
    motherFullName: optional(input.motherFullName),
    fatherFullName: optional(input.fatherFullName),
    fullAddress: optional(input.fullAddress),
    addrUnit: optional(input.addrUnit),
    addrBuilding: optional(input.addrBuilding),
    addrLot: optional(input.addrLot),
    addrStreet: optional(input.addrStreet),
    addrSubdivision: optional(input.addrSubdivision),
    addrBarangay: optional(input.addrBarangay),
    addrTownDistrict: optional(input.addrTownDistrict),
    addrCity: optional(input.addrCity),
    province: optional(input.province),
    foreignAddress: optional(input.foreignAddress),
    foreignCountry: optional(input.foreignCountry),
    foreignPostalCode: optional(input.foreignPostalCode),
    munCode: optional(input.munCode),
    landline: optional(input.landline),
    fax: optional(input.fax),
    mobile: optional(input.mobile),
    email: optional(input.email),
    taxType: optional(input.taxType || 'Income Tax'),
    formType: optional(input.formType || '1700'),
    atc: optional(input.atc || 'II 011'),
    idType: optional(input.idType),
    idNumber: optional(input.idNumber),
    idEffectivity: optional(input.idEffectivity),
    idExpiry: optional(input.idExpiry),
    idIssuer: optional(input.idIssuer),
    idPlace: optional(input.idPlace),
    rdoCode: normalizeRdoCode(input.rdoCode),
    zipCode: optional(input.zipCode),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const columns = Object.keys(fields);
  const placeholders = columns.map(() => '?').join(', ');
  const result = await run(
    `INSERT INTO taxpayers (${columns.join(', ')}) VALUES (${placeholders})`,
    Object.values(fields),
  );

  return result.lastID;
}

async function insertSpouse(taxpayerId, input) {
  const result = await run(
    `INSERT INTO spouses (
      taxpayerId, spouseTin, spouseFullName, spouseEmployment, exemptionClaimant
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      taxpayerId,
      optional(input.spouseTin),
      optional(input.spouseFullName),
      optional(input.spouseEmployment),
      optional(input.exemptionClaimant || 'husband'),
    ],
  );
  return result.lastID;
}

async function insertEmployer(taxpayerId, input) {
  const result = await run(
    `INSERT INTO employers (
      taxpayerId, employerTin, employerFullName, employerFullAddress, empLandline,
      munCode, employerZipCode, registeringOfficeType, employmentType, hireDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taxpayerId,
      optional(input.employerTin),
      optional(input.employerFullName),
      optional(input.employerFullAddress),
      optional(input.empLandline),
      optional(input.munCode),
      optional(input.employerZipCode),
      optional(input.registeringOfficeType || 'head'),
      optional(input.employmentType || 'primary'),
      optional(input.hireDate),
    ],
  );
  return result.lastID;
}

async function insertDependent(taxpayerId, input) {
  const result = await run(
    `INSERT INTO dependents (
      taxpayerId, fullName, dateOfBirth, isIncapacitated
    ) VALUES (?, ?, ?, ?)`,
    [
      taxpayerId,
      optional(input.fullName),
      optional(input.dateOfBirth),
      input.isIncapacitated ? 1 : 0,
    ],
  );
  return result.lastID;
}

async function insertFormSubmission(taxpayerId, input = {}) {
  const timestamp = nowIso();
  const companyName = optional(input.companyName || await currentCompanyName());
  const fields = {
    taxpayerId,
    formType: optional(input.formType || '1700'),
    taxableYear: optionalNumber(input.taxableYear ?? new Date().getFullYear()),
    taxablePeriod: optional(input.taxablePeriod),
    grossIncome: optionalNumber(input.grossIncome),
    allowableDeductions: optionalNumber(input.allowableDeductions),
    taxableIncome: optionalNumber(input.taxableIncome),
    taxDue: optionalNumber(input.taxDue),
    taxWithheld: optionalNumber(input.taxWithheld),
    taxPayable: optionalNumber(input.taxPayable),
    penaltiesAndInterest: optionalNumber(input.penaltiesAndInterest),
    totalAmountDue: optionalNumber(input.totalAmountDue),
    status: optional(input.status || 'draft'),
    companyName,
    filedDate: optional(input.filedDate),
    remarks: optional(input.remarks),
    formData: typeof input.formData === 'string' ? input.formData : JSON.stringify(input.formData ?? input),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const columns = Object.keys(fields);
  const placeholders = columns.map(() => '?').join(', ');
  const result = await run(
    `INSERT INTO form_submissions (${columns.join(', ')}) VALUES (${placeholders})`,
    Object.values(fields),
  );

  return result.lastID;
}

export async function listTaxpayers() {
  const rows = await all(`
    SELECT taxpayers.*
    FROM taxpayers
    WHERE EXISTS (
      SELECT 1
      FROM form_submissions
      WHERE form_submissions.taxpayerId = taxpayers.id
    )
    ORDER BY taxpayers.updatedAt DESC, taxpayers.id DESC
  `);
  return Promise.all(rows.map((row) => hydrateTaxpayer(row)));
}

export async function getTaxpayerById(id) {
  const row = await get('SELECT * FROM taxpayers WHERE id = ?', [id]);
  return hydrateTaxpayer(row);
}

export async function createTaxpayer(input) {
  const id = await insertTaxpayer(input);
  return getTaxpayerById(id);
}

export async function updateTaxpayer(id, input) {
  const allowed = [
    'tin', 'birRegDate', 'pcn', 'taxpayerType', 'fullName', 'gender', 'civilStatus',
    'dateOfBirth', 'placeOfBirth', 'citizenship', 'otherCitizenship', 'motherFullName',
    'fatherFullName', 'fullAddress', 'addrUnit', 'addrBuilding', 'addrLot', 'addrStreet',
    'addrSubdivision', 'addrBarangay', 'addrTownDistrict', 'addrCity', 'province',
    'foreignAddress', 'foreignCountry', 'foreignPostalCode', 'munCode', 'landline',
    'fax', 'mobile', 'email', 'taxType', 'formType', 'atc', 'idType', 'idNumber',
    'idEffectivity', 'idExpiry', 'idIssuer', 'idPlace', 'rdoCode', 'zipCode',
  ];
  const entries = allowed
    .filter((key) => input[key] !== undefined)
    .map((key) => [key, key === 'rdoCode' ? normalizeRdoCode(input[key]) : input[key]]);

  if (entries.length === 0) return getTaxpayerById(id);

  const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(nowIso(), id);

  await run(`UPDATE taxpayers SET ${assignments}, updatedAt = ? WHERE id = ?`, values);
  return getTaxpayerById(id);
}

export async function createSpouse(taxpayerId, input) {
  await insertSpouse(taxpayerId, input);
  return get('SELECT * FROM spouses WHERE taxpayerId = ? ORDER BY id DESC LIMIT 1', [taxpayerId]);
}

export async function createEmployer(taxpayerId, input) {
  const id = await insertEmployer(taxpayerId, input);
  return get('SELECT * FROM employers WHERE id = ?', [id]);
}

export async function listForms(filters = {}) {
  const clauses = [];
  const params = [];
  const companyName = filters.companyName ?? await currentCompanyName();

  if (filters.taxpayerId !== undefined) {
    clauses.push('taxpayerId = ?');
    params.push(filters.taxpayerId);
  }
  if (filters.formType) {
    clauses.push('formType = ?');
    params.push(filters.formType);
  }
  if (filters.status) {
    clauses.push('status = ?');
    params.push(filters.status);
  }
  if (companyName) {
    clauses.push('companyName = ?');
    params.push(companyName);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await all(
    `SELECT * FROM form_submissions ${where} ORDER BY updatedAt DESC, id DESC`,
    params,
  );
  return Promise.all(rows.map((row) => hydrateForm(row)));
}

export async function getFormById(id) {
  const row = await get('SELECT * FROM form_submissions WHERE id = ?', [id]);
  return hydrateForm(row);
}

export async function createForm(input) {
  if (input.taxpayer) {
    const result = await createApplication({
      taxpayer: input.taxpayer,
      spouse: input.spouse,
      employers: input.employers,
      dependents: input.dependents,
      form: { ...(input.form ?? input), companyName: input.companyName },
    });
    return getFormById(result.formId);
  }

  const formId = await insertFormSubmission(input.taxpayerId, input);
  return getFormById(formId);
}

export async function updateForm(id, input) {
  const allowed = [
    'formType', 'taxableYear', 'taxablePeriod', 'grossIncome', 'allowableDeductions',
    'taxableIncome', 'taxDue', 'taxWithheld', 'taxPayable', 'penaltiesAndInterest',
    'totalAmountDue', 'status', 'companyName', 'filedDate', 'remarks', 'formData',
  ];
  const entries = allowed.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]);

  if (entries.length === 0) return getFormById(id);

  const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(nowIso(), id);

  const result = await run(`UPDATE form_submissions SET ${assignments}, updatedAt = ? WHERE id = ?`, values);
  if (result.changes === 0) return null;
  return getFormById(id);
}

export async function deleteForm(id) {
  await run('BEGIN TRANSACTION');
  try {
    const form = await get('SELECT taxpayerId FROM form_submissions WHERE id = ?', [id]);
    if (!form) {
      await run('ROLLBACK');
      return false;
    }

    const result = await run('DELETE FROM taxpayers WHERE id = ?', [form.taxpayerId]);
    await run('COMMIT');
    return result.changes > 0;
  } catch (err) {
    await run('ROLLBACK').catch(() => {});
    throw err;
  }
}

export async function getProfile() {
  return get('SELECT * FROM office_profiles WHERE id = 1');
}

export async function updateProfile(input) {
  const allowed = [
    'officerName', 'companyName', 'role', 'region', 'office', 'phone', 'email', 'street',
    'barangay', 'city', 'province', 'zipCode', 'gender', 'photoDataUrl',
  ];
  const entries = allowed
    .filter((key) => input[key] !== undefined)
    .map((key) => [key, optional(input[key])]);

  if (entries.length === 0) return getProfile();

  const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(nowIso());

  await run(`UPDATE office_profiles SET ${assignments}, updatedAt = ? WHERE id = 1`, values);
  return getProfile();
}

export async function createApplication(input) {
  await run('BEGIN TRANSACTION');
  try {
    const taxpayerId = await insertTaxpayer(input.taxpayer);

    if (input.spouse) await insertSpouse(taxpayerId, input.spouse);

    for (const employer of input.employers ?? []) {
      await insertEmployer(taxpayerId, employer);
    }

    for (const dependent of input.dependents ?? []) {
      await insertDependent(taxpayerId, dependent);
    }

    const formId = await insertFormSubmission(taxpayerId, input.form ?? {});
    await run('COMMIT');
    return { taxpayerId, formId };
  } catch (err) {
    await run('ROLLBACK').catch(() => {});
    throw err;
  }
}

export async function getStatsSummary() {
  const companyName = await currentCompanyName();
  const [totalRow, taxpayerRow, statusRows, typeRows, rdoRows, totalsRow] = await Promise.all([
    get('SELECT COUNT(*) AS total FROM form_submissions WHERE companyName = ?', [companyName]),
    get(`
      SELECT COUNT(DISTINCT taxpayers.tin) AS totalTaxpayers
      FROM taxpayers
      INNER JOIN form_submissions ON form_submissions.taxpayerId = taxpayers.id
      WHERE form_submissions.companyName = ?
    `, [companyName]),
    all('SELECT status, COUNT(*) AS total FROM form_submissions WHERE companyName = ? GROUP BY status', [companyName]),
    all(`
      SELECT taxpayers.taxpayerType, COUNT(DISTINCT taxpayers.id) AS total
      FROM taxpayers
      INNER JOIN form_submissions ON form_submissions.taxpayerId = taxpayers.id
      WHERE form_submissions.companyName = ?
      GROUP BY taxpayers.taxpayerType
    `, [companyName]),
    all(`
      SELECT taxpayers.rdoCode, COUNT(DISTINCT taxpayers.id) AS total
      FROM taxpayers
      INNER JOIN form_submissions ON form_submissions.taxpayerId = taxpayers.id
      WHERE form_submissions.companyName = ?
        AND taxpayers.rdoCode IS NOT NULL
        AND taxpayers.rdoCode != ''
      GROUP BY taxpayers.rdoCode
    `, [companyName]),
    get(`
      SELECT
        COALESCE(SUM(taxDue), 0) AS totalTaxDue,
        COALESCE(SUM(taxPayable), 0) AS totalTaxPayable
      FROM form_submissions
      WHERE companyName = ?
    `, [companyName]),
  ]);

  const byStatus = { draft: 0, submitted: 0, filed: 0, amended: 0 };
  for (const row of statusRows) {
    byStatus[row.status] = row.total; 
  }

  const byType = {};
  for (const row of typeRows) {
    byType[row.taxpayerType || 'unknown'] = row.total;
  }

  const byRdo = {};
  for (const row of rdoRows) {
    byRdo[row.rdoCode] = row.total;
  }

  return {
    total: totalRow.total,
    totalTaxpayers: taxpayerRow.totalTaxpayers,
    byStatus,
    byType,
    byRdo,
    companyName,
    totalTaxDue: totalsRow.totalTaxDue,
    totalTaxPayable: totalsRow.totalTaxPayable,
  };
}

export function closeDatabase() {
  if (!db) return Promise.resolve();

  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else {
        db = undefined;
        resolve();
      }
    });
  });
}
