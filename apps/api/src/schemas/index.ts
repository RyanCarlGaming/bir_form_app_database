import { z } from "zod";

// ── Taxpayer ─────────────────────────────────────────────────────────────────

const taxpayerTypeValues = ["individual", "corporation", "partnership", "estate", "trust"] as const;

export const CreateTaxpayerBody = z.object({
  tin: z.string().min(1),
  registeredName: z.string().min(1),
  tradeName: z.string().optional(),
  taxpayerType: z.enum(taxpayerTypeValues),
  address: z.string().min(1),
  zipCode: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  rdoCode: z.string().min(1),
  lineOfBusiness: z.string().optional(),
});

export const UpdateTaxpayerBody = CreateTaxpayerBody.partial();

export const TaxpayerIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

// ── Form submission ───────────────────────────────────────────────────────────

const formStatusValues = ["draft", "submitted", "filed", "amended"] as const;

export const CreateFormBody = z.object({
  taxpayerId: z.number().int().positive(),
  formType: z.string().min(1),
  taxableYear: z.number().int().optional(),
  taxablePeriod: z.string().optional(),
  taxablePeriodEnd: z.string().optional(),
  grossIncome: z.number().optional(),
  allowableDeductions: z.number().optional(),
  taxableIncome: z.number().optional(),
  taxDue: z.number().optional(),
  taxWithheld: z.number().optional(),
  taxPayable: z.number().optional(),
  penaltiesAndInterest: z.number().optional(),
  totalAmountDue: z.number().optional(),
  status: z.enum(formStatusValues).optional(),
  filedDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
  formData: z.string().optional(),
});

export const UpdateFormBody = CreateFormBody.partial();

export const FormIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const ListFormsQuery = z.object({
  taxpayerId: z.coerce.number().int().positive().optional(),
  formType: z.string().optional(),
  status: z.enum(formStatusValues).optional(),
});
