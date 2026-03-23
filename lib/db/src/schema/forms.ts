import { pgTable, text, serial, timestamp, pgEnum, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { taxpayersTable } from "./taxpayers";

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "submitted",
  "filed",
  "amended",
]);

export const formSubmissionsTable = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  taxpayerId: integer("taxpayer_id")
    .notNull()
    .references(() => taxpayersTable.id, { onDelete: "cascade" }),
  formType: text("form_type").notNull(),
  taxableYear: integer("taxable_year"),
  taxablePeriod: text("taxable_period"),
  taxablePeriodEnd: text("taxable_period_end"),
  grossIncome: numeric("gross_income", { precision: 15, scale: 2 }),
  allowableDeductions: numeric("allowable_deductions", { precision: 15, scale: 2 }),
  taxableIncome: numeric("taxable_income", { precision: 15, scale: 2 }),
  taxDue: numeric("tax_due", { precision: 15, scale: 2 }),
  taxWithheld: numeric("tax_withheld", { precision: 15, scale: 2 }),
  taxPayable: numeric("tax_payable", { precision: 15, scale: 2 }),
  penaltiesAndInterest: numeric("penalties_and_interest", { precision: 15, scale: 2 }),
  totalAmountDue: numeric("total_amount_due", { precision: 15, scale: 2 }),
  status: formStatusEnum("status").notNull().default("draft"),
  filedDate: timestamp("filed_date"),
  remarks: text("remarks"),
  formData: jsonb("form_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
