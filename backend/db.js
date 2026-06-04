import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'bir_forms.db');
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

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

const taxpayerTypeToDb = {
  local: 'Local Employee',
  resident: 'Resident Alien',
  alien: 'Non-Resident Alien',
};

const taxpayerTypeFromDb = {
  'Local Employee': 'local',
  'Resident Alien': 'resident',
  'Non-Resident Alien': 'alien',
};

const civilStatusToDb = {
  single: 'Single',
  married: 'Married',
  widowed: 'Widow/er',
  separated: 'Legally Separated',
};

const civilStatusFromDb = {
  Single: 'single',
  Married: 'married',
  'Widow/er': 'widowed',
  'Legally Separated': 'separated',
  'With Qualified Dependent Child/ren': 'single',
};

const genderToDb = { male: 'Male', female: 'Female' };
const genderFromDb = { Male: 'male', Female: 'female' };

const empTypeToDb = {
  primary: 'Primary',
  concurrent: 'Concurrent',
  successive: 'Successive',
  spouse: 'Concurrent',
};

const empTypeFromDb = {
  Primary: 'primary',
  Concurrent: 'concurrent',
  Successive: 'successive',
};

const spouseEmploymentToDb = {
  unemployed: 'Unemployed',
  local: 'Employed Locally',
  abroad: 'Employed Abroad',
  business: 'Engaged in Business/Practice of Profession',
  '': 'Unemployed',
};

const spouseEmploymentFromDb = {
  Unemployed: 'unemployed',
  'Employed Locally': 'local',
  'Employed Abroad': 'abroad',
  'Engaged in Business/Practice of Profession': 'business',
};

const exemptionToDb = {
  husband: 'Husband Claims',
  wife: 'Wife Claims',
};

const exemptionFromDb = {
  'Husband Claims': 'husband',
  'Wife Claims': 'wife',
};

function valueOrNull(value) {
  return value === undefined || value === '' ? null : value;
}

function requiredText(value, fallback = 'N/A') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function fullAddressFromPayload(data) {
  if (data.fullAddress) return data.fullAddress;
  return [
    data.addrUnit,
    data.addrBuilding,
    data.addrLot,
    data.addrStreet,
    data.addrSubdivision,
    data.addrBarangay,
    data.addrTownDistrict,
    data.addrCity,
  ].filter(Boolean).join(', ');
}

async function ensureLocation({ munCode, mun, rdoCode, zipCode }) {
  const code = requiredText(munCode, '000000000');
  await run(
    `INSERT INTO location (mun_code, mun, rdo_code, zip_code)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(mun_code) DO UPDATE SET
       mun = COALESCE(excluded.mun, location.mun),
       rdo_code = COALESCE(excluded.rdo_code, location.rdo_code),
       zip_code = COALESCE(excluded.zip_code, location.zip_code)`,
    [code, requiredText(mun, 'Unknown'), requiredText(rdoCode, '000'), requiredText(zipCode, '0000')],
  );
  return code;
}

function mapTaxpayer(row, spouse, employers = [], dependents = [], formSubmissions = []) {
  if (!row) return null;
  return {
    id: row.applicant_id,
    tin: row.taxpayer_tin ?? '',
    birRegDate: row.bir_reg_date ?? '',
    pcn: row.pcn ?? '',
    taxpayerType: taxpayerTypeFromDb[row.taxpayer_type] ?? row.taxpayer_type ?? 'local',
    fullName: row.taxpayer_fullname,
    gender: genderFromDb[row.gender] ?? row.gender,
    civilStatus: civilStatusFromDb[row.civil_status] ?? row.civil_status,
    dateOfBirth: row.date_of_birth,
    placeOfBirth: row.place_of_birth,
    citizenship: row.citizenship,
    otherCitizenship: row.other_citizenship ?? '',
    motherFullName: row.mother_fullname,
    fatherFullName: row.father_fullname,
    fullAddress: row.full_address,
    addrStreet: row.full_address,
    addrBarangay: '',
    addrCity: row.mun ?? '',
    foreignAddress: row.foreign_address ?? '',
    munCode: row.mun_code,
    landline: row.landline ?? '',
    fax: row.fax ?? '',
    mobile: row.mobile ?? '',
    email: row.email ?? '',
    taxType: row.tax_type,
    formType: row.form_type,
    atc: row.atc,
    idType: row.id_type,
    idNumber: row.id_number,
    idEffectivity: row.id_effectivity,
    idExpiry: row.id_expiry,
    idIssuer: row.id_issuer,
    idPlace: row.id_place,
    rdoCode: row.rdo_code ?? '',
    zipCode: row.zip_code ?? '',
    createdAt: row.bir_reg_date ?? '',
    updatedAt: row.bir_reg_date ?? '',
    spouse,
    employers,
    dependents,
    formSubmissions,
  };
}

function mapSpouse(row) {
  if (!row) return undefined;
  return {
    id: row.applicant_id,
    taxpayerId: row.applicant_id,
    spouseTin: row.spouse_tin ?? '',
    spouseFullName: row.spouse_fullname,
    spouseEmployment: spouseEmploymentFromDb[row.spouse_employment_status] ?? row.spouse_employment_status,
    exemptionClaimant: exemptionFromDb[row.exemption_claimant] ?? '',
    spouseEmployerTin: row.spouse_emp_tin ?? '',
  };
}

function mapEmployer(row) {
  return {
    id: row.emp_tin,
    taxpayerId: row.applicant_id,
    employerTin: row.emp_tin,
    employerFullName: row.emp_fullname,
    employerFullAddress: row.emp_full_address ?? '',
    empLandline: row.emp_landline ?? '',
    munCode: row.emp_mun_code ?? '',
    employerZipCode: row.zip_code ?? '',
    registeringOfficeType: row.registering_office_type ?? 'head',
    employmentType: empTypeFromDb[row.emp_type] ?? 'primary',
    hireDate: row.hire_date ?? '',
  };
}

function mapDependent(row) {
  return {
    id: row.dependent_id,
    taxpayerId: row.applicant_id,
    fullName: row.dependent_fullname,
    dateOfBirth: row.dependent_dob,
    isIncapacitated: row.is_incapacitated === 'Yes',
  };
}

function mapForm(row, taxpayer) {
  if (!row) return null;
  return {
    id: row.id,
    taxpayerId: row.taxpayer_id,
    formType: row.form_type,
    taxableYear: row.taxable_year,
    taxablePeriod: row.taxable_period,
    grossIncome: row.gross_income,
    allowableDeductions: row.allowable_deductions,
    taxableIncome: row.taxable_income,
    taxDue: row.tax_due,
    taxWithheld: row.tax_withheld,
    taxPayable: row.tax_payable,
    penaltiesAndInterest: row.penalties_and_interest,
    totalAmountDue: row.total_amount_due,
    status: row.status,
    companyName: row.company_name,
    filedDate: row.filed_date,
    remarks: row.remarks,
    formData: row.form_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    taxpayer,
  };
}

export async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON');

  await run(`CREATE TABLE IF NOT EXISTS location (
    mun_code TEXT PRIMARY KEY,
    mun TEXT NOT NULL,
    rdo_code TEXT NOT NULL,
    zip_code TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS taxpayer (
    applicant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayer_tin TEXT NULL,
    bir_reg_date TEXT DEFAULT CURRENT_DATE,
    pcn TEXT NULL,
    taxpayer_type TEXT NOT NULL,
    taxpayer_fullname TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    civil_status TEXT NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Widow/er', 'Legally Separated', 'With Qualified Dependent Child/ren')),
    date_of_birth TEXT NOT NULL,
    place_of_birth TEXT NOT NULL,
    citizenship TEXT NOT NULL,
    other_citizenship TEXT NULL,
    mother_fullname TEXT NOT NULL,
    father_fullname TEXT NOT NULL,
    full_address TEXT NOT NULL,
    foreign_address TEXT NULL,
    mun_code TEXT NOT NULL,
    landline TEXT NULL,
    fax TEXT NULL,
    mobile TEXT NULL,
    email TEXT NOT NULL,
    tax_type TEXT NOT NULL DEFAULT 'Income Tax',
    form_type TEXT NOT NULL DEFAULT '1700',
    atc TEXT NOT NULL DEFAULT 'II011',
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL UNIQUE,
    id_effectivity TEXT NOT NULL,
    id_expiry TEXT NOT NULL,
    id_issuer TEXT NOT NULL,
    id_place TEXT NOT NULL,
    FOREIGN KEY (mun_code) REFERENCES location(mun_code)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS dependents (
    dependent_id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    dependent_fullname TEXT NOT NULL,
    dependent_dob TEXT NOT NULL,
    is_incapacitated TEXT NOT NULL CHECK (is_incapacitated IN ('Yes', 'No')),
    FOREIGN KEY (applicant_id) REFERENCES taxpayer(applicant_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS employer (
    emp_tin TEXT PRIMARY KEY,
    emp_fullname TEXT NOT NULL,
    emp_full_address TEXT NULL,
    emp_landline TEXT NULL,
    emp_mun_code TEXT NULL,
    registering_office_type TEXT NULL,
    FOREIGN KEY (emp_mun_code) REFERENCES location(mun_code)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS spouse (
    applicant_id INTEGER PRIMARY KEY,
    spouse_fullname TEXT NOT NULL,
    spouse_employment_status TEXT NOT NULL CHECK (spouse_employment_status IN ('Unemployed', 'Employed Locally', 'Employed Abroad', 'Engaged in Business/Practice of Profession')),
    exemption_claimant TEXT NULL CHECK (exemption_claimant IN ('Husband Claims', 'Wife Claims')),
    spouse_emp_tin TEXT NULL,
    spouse_tin TEXT NULL,
    FOREIGN KEY (applicant_id) REFERENCES taxpayer(applicant_id),
    FOREIGN KEY (spouse_emp_tin) REFERENCES employer(emp_tin)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS employee_relationship (
    applicant_id INTEGER,
    emp_tin TEXT,
    emp_type TEXT NOT NULL CHECK (emp_type IN ('Primary', 'Concurrent', 'Successive')),
    hire_date TEXT NOT NULL,
    PRIMARY KEY (applicant_id, emp_tin),
    FOREIGN KEY (applicant_id) REFERENCES taxpayer(applicant_id),
    FOREIGN KEY (emp_tin) REFERENCES employer(emp_tin)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayer_id INTEGER NOT NULL,
    form_type TEXT NOT NULL DEFAULT '1700',
    taxable_year INTEGER,
    taxable_period TEXT,
    gross_income REAL DEFAULT 0,
    allowable_deductions REAL DEFAULT 0,
    taxable_income REAL DEFAULT 0,
    tax_due REAL DEFAULT 0,
    tax_withheld REAL DEFAULT 0,
    tax_payable REAL DEFAULT 0,
    penalties_and_interest REAL DEFAULT 0,
    total_amount_due REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'submitted',
    company_name TEXT,
    filed_date TEXT,
    remarks TEXT,
    form_data TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taxpayer_id) REFERENCES taxpayer(applicant_id)
  )`);

  return dbPath;
}

async function loadTaxpayerRelations(id) {
  const spouse = mapSpouse(await get('SELECT * FROM spouse WHERE applicant_id = ?', [id]));
  const employers = (await all(`
    SELECT er.applicant_id, er.emp_type, er.hire_date, e.*, l.zip_code
    FROM employee_relationship er
    JOIN employer e ON e.emp_tin = er.emp_tin
    LEFT JOIN location l ON l.mun_code = e.emp_mun_code
    WHERE er.applicant_id = ?
    ORDER BY CASE er.emp_type WHEN 'Primary' THEN 0 WHEN 'Concurrent' THEN 1 ELSE 2 END
  `, [id])).map(mapEmployer);
  const dependents = (await all('SELECT * FROM dependents WHERE applicant_id = ?', [id])).map(mapDependent);
  const formRows = await all(
    'SELECT * FROM form_submissions WHERE taxpayer_id = ? ORDER BY updated_at DESC, id DESC',
    [id],
  );
  const formSubmissions = formRows.map((row) => mapForm(row));
  return { spouse, employers, dependents, formSubmissions };
}

export async function getTaxpayerById(id) {
  const row = await get(`
    SELECT t.*, l.mun, l.rdo_code, l.zip_code
    FROM taxpayer t
    LEFT JOIN location l ON l.mun_code = t.mun_code
    WHERE t.applicant_id = ?
  `, [id]);
  if (!row) return null;
  const relations = await loadTaxpayerRelations(id);
  return mapTaxpayer(
    row,
    relations.spouse,
    relations.employers,
    relations.dependents,
    relations.formSubmissions,
  );
}

export async function listTaxpayers() {
  const rows = await all(`
    SELECT t.*, l.mun, l.rdo_code, l.zip_code
    FROM taxpayer t
    LEFT JOIN location l ON l.mun_code = t.mun_code
    ORDER BY t.applicant_id DESC
  `);
  return Promise.all(rows.map(async (row) => {
    const relations = await loadTaxpayerRelations(row.applicant_id);
    return mapTaxpayer(
      row,
      relations.spouse,
      relations.employers,
      relations.dependents,
      relations.formSubmissions,
    );
  }));
}

export async function createTaxpayer(data) {
  const munCode = await ensureLocation({
    munCode: data.munCode,
    mun: data.addrCity,
    rdoCode: data.rdoCode,
    zipCode: data.zipCode,
  });
  const result = await run(`
    INSERT INTO taxpayer (
      taxpayer_tin, bir_reg_date, pcn, taxpayer_type, taxpayer_fullname, gender, civil_status,
      date_of_birth, place_of_birth, citizenship, other_citizenship, mother_fullname,
      father_fullname, full_address, foreign_address, mun_code, landline, fax, mobile,
      email, tax_type, form_type, atc, id_type, id_number, id_effectivity, id_expiry,
      id_issuer, id_place
    ) VALUES (?, COALESCE(?, CURRENT_DATE), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    valueOrNull(data.tin),
    valueOrNull(data.birRegDate),
    valueOrNull(data.pcn),
    taxpayerTypeToDb[data.taxpayerType] ?? requiredText(data.taxpayerType, 'Local Employee'),
    requiredText(data.fullName),
    genderToDb[data.gender] ?? requiredText(data.gender, 'Male'),
    civilStatusToDb[data.civilStatus] ?? requiredText(data.civilStatus, 'Single'),
    requiredText(data.dateOfBirth),
    requiredText(data.placeOfBirth),
    requiredText(data.citizenship),
    valueOrNull(data.otherCitizenship),
    requiredText(data.motherFullName),
    requiredText(data.fatherFullName),
    requiredText(fullAddressFromPayload(data)),
    valueOrNull(data.foreignAddress),
    munCode,
    valueOrNull(data.landline),
    valueOrNull(data.fax),
    valueOrNull(data.mobile),
    requiredText(data.email),
    requiredText(data.taxType, 'Income Tax'),
    requiredText(data.formType, '1700'),
    requiredText(data.atc, 'II011'),
    requiredText(data.idType),
    requiredText(data.idNumber, `ID-${Date.now()}`),
    requiredText(data.idEffectivity),
    requiredText(data.idExpiry),
    requiredText(data.idIssuer),
    requiredText(data.idPlace),
  ]);
  return getTaxpayerById(result.lastID);
}

export async function updateTaxpayer(id, data) {
  const existing = await getTaxpayerById(id);
  if (!existing) return null;
  const next = { ...existing, ...data };
  const munCode = await ensureLocation({
    munCode: next.munCode,
    mun: next.addrCity,
    rdoCode: next.rdoCode,
    zipCode: next.zipCode,
  });
  await run(`
    UPDATE taxpayer SET
      taxpayer_tin = ?, pcn = ?, taxpayer_type = ?, taxpayer_fullname = ?, gender = ?,
      civil_status = ?, date_of_birth = ?, place_of_birth = ?, citizenship = ?,
      other_citizenship = ?, mother_fullname = ?, father_fullname = ?, full_address = ?,
      foreign_address = ?, mun_code = ?, landline = ?, fax = ?, mobile = ?, email = ?,
      tax_type = ?, form_type = ?, atc = ?, id_type = ?, id_number = ?,
      id_effectivity = ?, id_expiry = ?, id_issuer = ?, id_place = ?
    WHERE applicant_id = ?
  `, [
    valueOrNull(next.tin),
    valueOrNull(next.pcn),
    taxpayerTypeToDb[next.taxpayerType] ?? next.taxpayerType,
    requiredText(next.fullName),
    genderToDb[next.gender] ?? next.gender,
    civilStatusToDb[next.civilStatus] ?? next.civilStatus,
    requiredText(next.dateOfBirth),
    requiredText(next.placeOfBirth),
    requiredText(next.citizenship),
    valueOrNull(next.otherCitizenship),
    requiredText(next.motherFullName),
    requiredText(next.fatherFullName),
    requiredText(fullAddressFromPayload(next)),
    valueOrNull(next.foreignAddress),
    munCode,
    valueOrNull(next.landline),
    valueOrNull(next.fax),
    valueOrNull(next.mobile),
    requiredText(next.email),
    requiredText(next.taxType, 'Income Tax'),
    requiredText(next.formType, '1700'),
    requiredText(next.atc, 'II011'),
    requiredText(next.idType),
    requiredText(next.idNumber),
    requiredText(next.idEffectivity),
    requiredText(next.idExpiry),
    requiredText(next.idIssuer),
    requiredText(next.idPlace),
    id,
  ]);
  return getTaxpayerById(id);
}

export async function createEmployer(taxpayerId, data) {
  const munCode = data.munCode ? await ensureLocation({
    munCode: data.munCode,
    rdoCode: data.rdoCode,
    zipCode: data.employerZipCode,
  }) : null;
  await run(`
    INSERT INTO employer (emp_tin, emp_fullname, emp_full_address, emp_landline, emp_mun_code, registering_office_type)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(emp_tin) DO UPDATE SET
      emp_fullname = excluded.emp_fullname,
      emp_full_address = excluded.emp_full_address,
      emp_landline = excluded.emp_landline,
      emp_mun_code = excluded.emp_mun_code,
      registering_office_type = excluded.registering_office_type
  `, [
    requiredText(data.employerTin),
    requiredText(data.employerFullName),
    valueOrNull(data.employerFullAddress),
    valueOrNull(data.empLandline),
    munCode,
    valueOrNull(data.registeringOfficeType),
  ]);
  await run(`
    INSERT INTO employee_relationship (applicant_id, emp_tin, emp_type, hire_date)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(applicant_id, emp_tin) DO UPDATE SET emp_type = excluded.emp_type, hire_date = excluded.hire_date
  `, [taxpayerId, requiredText(data.employerTin), empTypeToDb[data.employmentType] ?? 'Primary', requiredText(data.hireDate)]);
  const employers = (await loadTaxpayerRelations(taxpayerId)).employers;
  return employers.find((employer) => employer.employerTin === data.employerTin) ?? employers[0];
}

export async function createSpouse(taxpayerId, data) {
  await run(`
    INSERT INTO spouse (
      applicant_id, spouse_fullname, spouse_employment_status, exemption_claimant, spouse_emp_tin, spouse_tin
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(applicant_id) DO UPDATE SET
      spouse_fullname = excluded.spouse_fullname,
      spouse_employment_status = excluded.spouse_employment_status,
      exemption_claimant = excluded.exemption_claimant,
      spouse_emp_tin = excluded.spouse_emp_tin,
      spouse_tin = excluded.spouse_tin
  `, [
    taxpayerId,
    requiredText(data.spouseFullName),
    spouseEmploymentToDb[data.spouseEmployment] ?? data.spouseEmployment ?? 'Unemployed',
    exemptionToDb[data.exemptionClaimant] ?? null,
    valueOrNull(data.spouseEmployerTin),
    valueOrNull(data.spouseTin),
  ]);
  return mapSpouse(await get('SELECT * FROM spouse WHERE applicant_id = ?', [taxpayerId]));
}

export async function createForm(data) {
  const result = await run(`
    INSERT INTO form_submissions (
      taxpayer_id, form_type, taxable_year, taxable_period, gross_income, allowable_deductions,
      taxable_income, tax_due, tax_withheld, tax_payable, penalties_and_interest,
      total_amount_due, status, company_name, filed_date, remarks, form_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.taxpayerId,
    requiredText(data.formType, '1700'),
    valueOrNull(data.taxableYear),
    valueOrNull(data.taxablePeriod),
    data.grossIncome ?? 0,
    data.allowableDeductions ?? 0,
    data.taxableIncome ?? 0,
    data.taxDue ?? 0,
    data.taxWithheld ?? 0,
    data.taxPayable ?? 0,
    data.penaltiesAndInterest ?? 0,
    data.totalAmountDue ?? 0,
    data.status ?? 'submitted',
    valueOrNull(data.companyName),
    valueOrNull(data.filedDate),
    valueOrNull(data.remarks),
    data.formData ? JSON.stringify(data.formData) : null,
  ]);
  return getFormById(result.lastID);
}

export async function getFormById(id) {
  const row = await get('SELECT * FROM form_submissions WHERE id = ?', [id]);
  if (!row) return null;
  return mapForm(row, await getTaxpayerById(row.taxpayer_id));
}

export async function listForms(filters = {}) {
  const clauses = [];
  const params = [];
  if (filters.taxpayerId) {
    clauses.push('taxpayer_id = ?');
    params.push(filters.taxpayerId);
  }
  if (filters.formType) {
    clauses.push('form_type = ?');
    params.push(filters.formType);
  }
  if (filters.status) {
    clauses.push('status = ?');
    params.push(filters.status);
  }
  const rows = await all(`
    SELECT * FROM form_submissions
    ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
    ORDER BY updated_at DESC
  `, params);
  return Promise.all(rows.map(async (row) => mapForm(row, await getTaxpayerById(row.taxpayer_id))));
}

export async function updateForm(id, data) {
  const existing = await getFormById(id);
  if (!existing) return null;
  const next = { ...existing, ...data };
  await run(`
    UPDATE form_submissions SET
      form_type = ?, taxable_year = ?, taxable_period = ?, gross_income = ?,
      allowable_deductions = ?, taxable_income = ?, tax_due = ?, tax_withheld = ?,
      tax_payable = ?, penalties_and_interest = ?, total_amount_due = ?, status = ?,
      company_name = ?, filed_date = ?, remarks = ?, form_data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    requiredText(next.formType, '1700'),
    valueOrNull(next.taxableYear),
    valueOrNull(next.taxablePeriod),
    next.grossIncome ?? 0,
    next.allowableDeductions ?? 0,
    next.taxableIncome ?? 0,
    next.taxDue ?? 0,
    next.taxWithheld ?? 0,
    next.taxPayable ?? 0,
    next.penaltiesAndInterest ?? 0,
    next.totalAmountDue ?? 0,
    next.status ?? 'submitted',
    valueOrNull(next.companyName),
    valueOrNull(next.filedDate),
    valueOrNull(next.remarks),
    typeof next.formData === 'string' ? next.formData : JSON.stringify(next.formData ?? {}),
    id,
  ]);
  return getFormById(id);
}

export async function deleteForm(id) {
  const form = await get('SELECT taxpayer_id FROM form_submissions WHERE id = ?', [id]);
  if (!form) return false;

  const result = await run('DELETE FROM form_submissions WHERE id = ?', [id]);
  if (result.changes === 0) return false;

  const remainingForms = await get(
    'SELECT COUNT(*) AS total FROM form_submissions WHERE taxpayer_id = ?',
    [form.taxpayer_id],
  );

  if ((remainingForms?.total ?? 0) === 0) {
    await run('DELETE FROM spouse WHERE applicant_id = ?', [form.taxpayer_id]);
    await run('DELETE FROM dependents WHERE applicant_id = ?', [form.taxpayer_id]);
    await run('DELETE FROM employee_relationship WHERE applicant_id = ?', [form.taxpayer_id]);
    await run('DELETE FROM taxpayer WHERE applicant_id = ?', [form.taxpayer_id]);
  }

  return true;
}

export async function getStatsSummary() {
  const forms = await all('SELECT * FROM form_submissions');
  const taxpayers = await all(`
    SELECT t.*, l.rdo_code
    FROM taxpayer t
    LEFT JOIN location l ON l.mun_code = t.mun_code
  `);
  return {
    total: forms.length,
    totalTaxpayers: taxpayers.length,
    byStatus: forms.reduce((acc, form) => ({ ...acc, [form.status]: (acc[form.status] ?? 0) + 1 }), {}),
    byType: taxpayers.reduce((acc, taxpayer) => {
      const type = taxpayerTypeFromDb[taxpayer.taxpayer_type] ?? taxpayer.taxpayer_type;
      return { ...acc, [type]: (acc[type] ?? 0) + 1 };
    }, {}),
    byRdo: taxpayers.reduce((acc, taxpayer) => {
      const rdo = taxpayer.rdo_code ?? '000';
      return { ...acc, [rdo]: (acc[rdo] ?? 0) + 1 };
    }, {}),
    totalTaxDue: forms.reduce((sum, form) => sum + Number(form.tax_due ?? 0), 0),
    totalTaxPayable: forms.reduce((sum, form) => sum + Number(form.tax_payable ?? 0), 0),
    companyName: forms[0]?.company_name ?? '',
  };
}

export async function createApplication(data) {
  const taxpayer = await createTaxpayer(data.taxpayer ?? {});
  for (const employer of data.employers ?? []) {
    if (employer.employmentType !== 'spouse') {
      await createEmployer(taxpayer.id, employer);
    }
  }
  if (data.spouse) {
    await createSpouse(taxpayer.id, data.spouse);
  }
  for (const dependent of data.dependents ?? []) {
    await run(
      `INSERT INTO dependents (applicant_id, dependent_fullname, dependent_dob, is_incapacitated)
       VALUES (?, ?, ?, ?)`,
      [
        taxpayer.id,
        requiredText(dependent.fullName),
        requiredText(dependent.dateOfBirth),
        dependent.isIncapacitated ? 'Yes' : 'No',
      ],
    );
  }
  const form = await createForm({
    taxpayerId: taxpayer.id,
    formType: data.taxpayer?.formType ?? '1700',
    status: 'submitted',
    companyName: data.employers?.[0]?.employerFullName,
    formData: data,
  });
  return { taxpayerId: taxpayer.id, formId: form.id };
}

export async function closeDatabase() {
  return close();
}
