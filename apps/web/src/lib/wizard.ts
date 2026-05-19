import { createContext, useContext, type Dispatch } from "react";

export interface EmployerInput {
  employerTin: string;
  employerFullName: string;
  employerFullAddress: string;
  empLandline: string;
  munCode: string;
  registeringOfficeType: "head" | "branch" | "rdo" | "ltdo";
  employmentType: "primary" | "concurrent" | "successive";
  hireDate: string;
}

export interface DependentInput {
  fullName: string;
  dateOfBirth: string;
  isIncapacitated: boolean;
}

export interface WizardState {
  // Step 1 — Taxpayer Info
  tin: string;
  birRegDate: string;
  pcn: string;
  taxpayerType: "local" | "resident" | "alien";
  fullName: string;
  lastName: string;
  firstName: string;
  middleName: string;
  nameSuffix: string;
  gender: "male" | "female" | "";
  civilStatus: "single" | "married" | "widowed" | "separated" | "";
  dateOfBirth: string;
  placeOfBirth: string;
  citizenship: string;
  otherCitizenship: string;
  motherFullName: string;
  fatherFullName: string;
  // Step 2 — Address & Contact
  addrUnit: string;
  addrBuilding: string;
  addrLot: string;
  addrStreet: string;
  addrSubdivision: string;
  addrBarangay: string;
  addrTownDistrict: string;
  addrCity: string;
  province: string;
  foreignAddress: string;
  foreignCountry: string;
  foreignPostalCode: string;
  munCode: string;
  landline: string;
  fax: string;
  mobile: string;
  email: string;
  // Step 3 — Employer & Tax
  employers: EmployerInput[];
  taxType: string;
  formType: string;
  atc: string;
  rdoCode: string;
  zipCode: string;
  // Step 4 — Spouse & ID
  spouseTin: string;
  spouseFullName: string;
  spouseEmployment: string;
  exemptionClaimant: "husband" | "wife" | "";
  dependents: DependentInput[];
  idType: string;
  idNumber: string;
  idEffectivity: string;
  idExpiry: string;
  idIssuer: string;
  idPlace: string;
}

export const WIZARD_DEFAULT: WizardState = {
  tin: "", birRegDate: "", pcn: "", taxpayerType: "local",
  fullName: "", lastName: "", firstName: "", middleName: "", nameSuffix: "",
  gender: "", civilStatus: "",
  dateOfBirth: "", placeOfBirth: "", citizenship: "", otherCitizenship: "",
  motherFullName: "", fatherFullName: "",
  addrUnit: "", addrBuilding: "", addrLot: "", addrStreet: "",
  addrSubdivision: "", addrBarangay: "", addrTownDistrict: "", addrCity: "",
  province: "", foreignAddress: "", foreignCountry: "", foreignPostalCode: "",
  munCode: "",
  landline: "", fax: "", mobile: "", email: "",
  employers: [],
  taxType: "Compensation", formType: "1902", atc: "QC",
  rdoCode: "", zipCode: "",
  spouseTin: "", spouseFullName: "", spouseEmployment: "", exemptionClaimant: "",
  dependents: [],
  idType: "", idNumber: "", idEffectivity: "", idExpiry: "", idIssuer: "", idPlace: "",
};

export type WizardAction =
  | { type: "SET_STEP1"; payload: Partial<WizardState> }
  | { type: "SET_STEP2"; payload: Partial<WizardState> }
  | { type: "SET_STEP3"; payload: Partial<WizardState> }
  | { type: "SET_STEP4"; payload: Partial<WizardState> }
  | { type: "RESET" };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP1":
    case "SET_STEP2":
    case "SET_STEP3":
    case "SET_STEP4":
      return { ...state, ...action.payload };
    case "RESET":
      return WIZARD_DEFAULT;
  }
}

export const WizardContext = createContext<{
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
} | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardContext");
  return ctx;
}

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  clearWizard?: () => void;
  onGoTo?: (step: number) => void;
}
