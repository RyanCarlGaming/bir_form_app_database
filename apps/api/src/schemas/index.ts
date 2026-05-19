import { z } from "zod";

// ── Taxpayer ──────────────────────────────────────────────────────────────────

const taxpayerTypeValues = ["local", "resident", "alien"] as const;
const genderValues = ["male", "female"] as const;
const civilStatusValues = ["single", "married", "widowed", "separated"] as const;

export const CreateTaxpayerBody = z.object({
  // Part I — identity (items 5–14)
  tin:              z.string().length(12),
  birRegDate:       z.string().datetime(),
  pcn:              z.string().min(1),
  taxpayerType:     z.enum(taxpayerTypeValues),
  fullName:         z.string().min(1),
  gender:           z.enum(genderValues),
  civilStatus:      z.enum(civilStatusValues),
  dateOfBirth:      z.string().datetime(),
  placeOfBirth:     z.string().min(1),
  citizenship:      z.string().min(1),
  otherCitizenship: z.string().optional(),
  motherFullName:   z.string().min(1),
  fatherFullName:   z.string().min(1),

  // Part I — local address (item 15)
  addrUnit:         z.string().optional(),
  addrBuilding:     z.string().optional(),
  addrLot:          z.string().optional(),
  addrStreet:       z.string().min(1),
  addrSubdivision:  z.string().optional(),
  addrBarangay:     z.string().min(1),
  addrTownDistrict: z.string().optional(),
  addrCity:         z.string().min(1),

  // Part I — other address + contact (items 16–17, 22)
  foreignAddress:   z.string().optional(),
  munCode:          z.string().optional(),
  landline:         z.string().optional(),
  fax:              z.string().optional(),
  mobile:           z.string().optional(),
  email:            z.string().email().optional(),

  // Part I — tax classification (items 18–20)
  taxType:          z.string().min(1),
  formType:         z.string().min(1),
  atc:              z.string().min(1),

  // Part I — identification (item 21)
  idType:           z.string().min(1),
  idNumber:         z.string().min(1),
  idEffectivity:    z.string().datetime(),
  idExpiry:         z.string().datetime(),
  idIssuer:         z.string().min(1),
  idPlace:          z.string().min(1),

  // RDO + ZIP
  rdoCode:          z.number().int().positive(),
  zipCode:          z.string().min(1),
});

export const UpdateTaxpayerBody = CreateTaxpayerBody.partial();
export const TaxpayerIdParam = z.object({ id: z.coerce.number().int().positive() });

export const ListTaxpayersQuery = z.object({
  rdoCode:      z.coerce.number().int().positive().optional(),
  taxpayerType: z.enum(taxpayerTypeValues).optional(),
});

// ── Spouse ────────────────────────────────────────────────────────────────────

const exemptionClaimantValues = ["husband", "wife"] as const;

export const CreateSpouseBody = z.object({
  spouseTin:         z.string().optional(),
  spouseFullName:    z.string().min(1),
  spouseEmployment:  z.string().min(1),
  exemptionClaimant: z.enum(exemptionClaimantValues),
});

// ── Employer ──────────────────────────────────────────────────────────────────

const registeringOfficeTypeValues = ["head", "branch", "rdo", "ltdo"] as const;
const employmentTypeValues = ["primary", "concurrent", "successive"] as const;

export const CreateEmployerBody = z.object({
  employerTin:           z.string().min(1),
  employerFullName:      z.string().min(1),
  employerFullAddress:   z.string().min(1),
  empLandline:           z.string().optional(),
  munCode:               z.string().optional(),
  registeringOfficeType: z.enum(registeringOfficeTypeValues),
  employmentType:        z.enum(employmentTypeValues),
  hireDate:              z.string().datetime(),
});

// ── Dependent ─────────────────────────────────────────────────────────────────

export const CreateDependentBody = z.object({
  fullName:        z.string().min(1),
  dateOfBirth:     z.string().datetime(),
  isIncapacitated: z.boolean(),
});

// ── Application (atomic create) ───────────────────────────────────────────────

export const CreateApplicationBody = z.object({
  taxpayer:   CreateTaxpayerBody,
  spouse:     CreateSpouseBody.optional(),
  employers:  z.array(CreateEmployerBody).default([]),
  dependents: z.array(CreateDependentBody).default([]),
  form: z.object({
    formType:      z.string().min(1),
    taxableYear:   z.number().int().optional(),
    taxablePeriod: z.string().optional(),
    status:        z.enum(["draft", "submitted"] as const).optional(),
    remarks:       z.string().optional(),
  }),
});

// ── Form submission ───────────────────────────────────────────────────────────

const formStatusValues = ["draft", "submitted", "filed", "amended"] as const;

export const CreateFormBody = z.object({
  taxpayerId:           z.number().int().positive(),
  formType:             z.string().min(1),
  taxableYear:          z.number().int().optional(),
  taxablePeriod:        z.string().optional(),
  taxablePeriodEnd:     z.string().optional(),
  grossIncome:          z.number().optional(),
  allowableDeductions:  z.number().optional(),
  taxableIncome:        z.number().optional(),
  taxDue:               z.number().optional(),
  taxWithheld:          z.number().optional(),
  taxPayable:           z.number().optional(),
  penaltiesAndInterest: z.number().optional(),
  totalAmountDue:       z.number().optional(),
  status:               z.enum(formStatusValues).optional(),
  filedDate:            z.string().datetime().optional(),
  remarks:              z.string().optional(),
  formData:             z.string().optional(),
});

export const UpdateFormBody = CreateFormBody.partial();
export const FormIdParam = z.object({ id: z.coerce.number().int().positive() });
export const ListFormsQuery = z.object({
  taxpayerId: z.coerce.number().int().positive().optional(),
  formType:   z.string().optional(),
  status:     z.enum(formStatusValues).optional(),
});
