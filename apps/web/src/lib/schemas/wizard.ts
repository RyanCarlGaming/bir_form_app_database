import { z } from "zod";

export const step1Schema = z.object({
  tin: z.string().min(9, "TIN must be at least 9 digits"),
  birRegDate: z.string().min(1, "BIR registration date required"),
  pcn: z.string(),
  taxpayerType: z.enum(["local", "resident", "alien"]),
  lastName:   z.string().min(1, "Required"),
  firstName:  z.string().min(1, "Required"),
  middleName: z.string(),
  nameSuffix: z.string(),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "Select a gender" }) }),
  civilStatus: z.enum(["single", "married", "widowed", "separated"], {
    errorMap: () => ({ message: "Select civil status" }),
  }),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  placeOfBirth: z.string().min(1, "Place of birth required"),
  citizenship: z.string().min(1, "Citizenship required"),
  otherCitizenship: z.string(),
  motherFullName: z.string().min(1, "Mother's maiden name required"),
  fatherFullName: z.string().min(1, "Father's name required"),
});
export type Step1Values = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
  addrStreet:       z.string().min(1, "Required"),
  addrCity:         z.string().min(1, "Required"),
  province:         z.string().min(1, "Required"),
  munCode:          z.string(),
  zipCode:          z.string().min(1, "ZIP code required"),
  rdoCode:          z.string().min(1, "RDO code required"),
  foreignAddress:   z.string(),
  foreignCountry:    z.string(),
  foreignPostalCode: z.string(),
  mobile:           z.string().min(1, "Mobile number required"),
  email:            z.string().email("Valid email required"),
  landline:         z.string(),
  fax:              z.string(),
});
export type Step2Values = z.infer<typeof step2Schema>;

const employerSchema = z.object({
  employerTin: z.string().min(1, "Employer TIN required"),
  employerFullName: z.string().min(1, "Employer name required"),
  employerFullAddress: z.string().min(1, "Employer address required"),
  empLandline: z.string(),
  munCode: z.string(),
  registeringOfficeType: z.enum(["head", "branch", "rdo", "ltdo"]),
  employmentType: z.enum(["primary", "concurrent", "successive"]),
  hireDate: z.string().min(1, "Hire date required"),
});

export const step3Schema = z.object({
  taxType: z.string().min(1, "Required"),
  formType: z.string().min(1, "Required"),
  atc: z.string().min(1, "Required"),
  employers: z.array(employerSchema).min(1, "At least one employer required"),
});
export type Step3Values = z.infer<typeof step3Schema>;

const dependentSchema = z.object({
  fullName: z.string().min(1, "Name required"),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  isIncapacitated: z.boolean(),
});

export const step4Schema = z
  .object({
    spouseTin: z.string(),
    spouseFullName: z.string(),
    spouseEmployment: z.string(),
    exemptionClaimant: z.enum(["husband", "wife", ""]),
    dependents: z.array(dependentSchema),
    idType: z.string().min(1, "ID type required"),
    idNumber: z.string().min(1, "ID number required"),
    idIssuer: z.string().min(1, "Issuer required"),
    idPlace: z.string().min(1, "Place of issue required"),
    idEffectivity: z.string().min(1, "Effectivity date required"),
    idExpiry: z.string().min(1, "Expiry date required"),
  })
  .refine(
    (d) => !d.idEffectivity || !d.idExpiry || d.idExpiry >= d.idEffectivity,
    { message: "Expiry must be after effectivity date", path: ["idExpiry"] },
  );
export type Step4Values = z.infer<typeof step4Schema>;
