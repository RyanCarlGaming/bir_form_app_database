export type TaxpayerStatus = "draft" | "submitted" | "filed" | "amended";

export interface Taxpayer {
  id: number; tin: string; birRegDate: string; pcn: string;
  taxpayerType: "local" | "resident" | "alien";
  fullName: string; gender: "male" | "female";
  civilStatus: "single" | "married" | "widowed" | "separated";
  dateOfBirth: string; placeOfBirth: string;
  citizenship: string; otherCitizenship?: string;
  motherFullName: string; fatherFullName: string;
  addrUnit?: string; addrBuilding?: string; addrLot?: string;
  addrStreet: string; addrSubdivision?: string;
  addrBarangay: string; addrTownDistrict?: string; addrCity: string;
  foreignAddress?: string; munCode?: string;
  landline?: string; fax?: string; mobile?: string; email?: string;
  taxType: string; formType: string; atc: string;
  idType: string; idNumber: string;
  idEffectivity: string; idExpiry: string;
  idIssuer: string; idPlace: string;
  rdoCode: number; zipCode: string;
  createdAt: string; updatedAt: string;
  spouse?: Spouse; employers?: Employer[]; dependents?: Dependent[];
  formSubmissions?: FormSubmission[];
}

export interface Spouse {
  id: number; taxpayerId: number;
  spouseTin?: string; spouseFullName: string;
  spouseEmployment: string;
  exemptionClaimant: "husband" | "wife";
}

export interface Employer {
  id: number; taxpayerId: number;
  employerTin: string; employerFullName: string;
  employerFullAddress: string; empLandline?: string; munCode?: string;
  registeringOfficeType: "head" | "branch" | "rdo" | "ltdo";
  employmentType: "primary" | "concurrent" | "successive";
  hireDate: string;
}

export interface Dependent {
  id: number; taxpayerId: number;
  fullName: string; dateOfBirth: string; isIncapacitated: boolean;
}

export interface FormSubmission {
  id: number; taxpayerId: number; formType: string;
  taxableYear?: number; taxablePeriod?: string;
  grossIncome?: number; allowableDeductions?: number;
  taxableIncome?: number; taxDue?: number; taxWithheld?: number;
  taxPayable?: number; penaltiesAndInterest?: number; totalAmountDue?: number;
  status: TaxpayerStatus; companyName?: string; filedDate?: string; remarks?: string; formData?: string;
  createdAt: string; updatedAt: string;
  taxpayer?: Taxpayer;
}

export interface StatsSummary {
  total: number;
  totalTaxpayers: number;
  byStatus: Partial<Record<TaxpayerStatus, number>>;
  byType: Record<string, number>;
  byRdo: Record<string, number>;
  totalTaxDue: number;
  totalTaxPayable: number;
  companyName?: string;
}

export interface OfficeProfile {
  id: number;
  officerName: string;
  companyName: string;
  role: string;
  region: string;
  office: string;
  phone?: string;
  email?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  photoDataUrl?: string;
  gender?: "male" | "female";
  updatedAt: string;
}

// ── Base fetch ────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  taxpayers: {
    list: () => apiFetch<Taxpayer[]>("/taxpayers"),
    get:  (id: number) => apiFetch<Taxpayer>(`/taxpayers/${id}`),
    create: (body: unknown) =>
      apiFetch<Taxpayer>("/taxpayers", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: unknown) =>
      apiFetch<Taxpayer>(`/taxpayers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    createSpouse: (id: number, body: unknown) =>
      apiFetch<Spouse>(`/taxpayers/${id}/spouse`, { method: "POST", body: JSON.stringify(body) }),
    createEmployer: (id: number, body: unknown) =>
      apiFetch<Employer>(`/taxpayers/${id}/employers`, { method: "POST", body: JSON.stringify(body) }),
  },
  forms: {
    list: (params?: { taxpayerId?: number; formType?: string; status?: TaxpayerStatus }) => {
      const q = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      );
      return apiFetch<FormSubmission[]>(`/forms${q.toString() ? `?${q}` : ""}`);
    },
    get:    (id: number) => apiFetch<FormSubmission>(`/forms/${id}`),
    create: (body: unknown) =>
      apiFetch<FormSubmission>("/forms", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: unknown) =>
      apiFetch<FormSubmission>(`/forms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: number) =>
      apiFetch<{ message: string }>(`/forms/${id}`, { method: "DELETE" }),
    stats:  () => apiFetch<StatsSummary>("/forms/stats/summary"),
  },
  applications: {
    create: (body: unknown) =>
      apiFetch<{ taxpayerId: number; formId: number }>("/applications", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  profile: {
    get: () => apiFetch<OfficeProfile>("/profile"),
    update: (body: unknown) =>
      apiFetch<OfficeProfile>("/profile", { method: "PUT", body: JSON.stringify(body) }),
  },
};
