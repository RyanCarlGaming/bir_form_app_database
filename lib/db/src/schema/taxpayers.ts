import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const taxpayerTypeEnum = pgEnum("taxpayer_type", [
  "individual",
  "corporation",
  "partnership",
  "estate",
  "trust",
]);

export const taxpayersTable = pgTable("taxpayers", {
  id: serial("id").primaryKey(),
  tin: text("tin").notNull().unique(),
  registeredName: text("registered_name").notNull(),
  tradeName: text("trade_name"),
  taxpayerType: taxpayerTypeEnum("taxpayer_type").notNull(),
  address: text("address").notNull(),
  zipCode: text("zip_code").notNull(),
  email: text("email"),
  phone: text("phone"),
  rdoCode: text("rdo_code").notNull(),
  lineOfBusiness: text("line_of_business"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaxpayerSchema = createInsertSchema(taxpayersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTaxpayer = z.infer<typeof insertTaxpayerSchema>;
export type Taxpayer = typeof taxpayersTable.$inferSelect;
