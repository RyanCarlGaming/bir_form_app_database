import { Router, type IRouter } from "express";
import { db, formSubmissionsTable, taxpayersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateFormSubmissionBody,
  UpdateFormSubmissionBody,
  GetFormSubmissionParams,
  UpdateFormSubmissionParams,
  DeleteFormSubmissionParams,
  ListFormsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (req, res) => {
  try {
    const [{ count: totalForms }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formSubmissionsTable);

    const [{ count: totalTaxpayers }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(taxpayersTable);

    const formsByStatusRows = await db
      .select({
        status: formSubmissionsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(formSubmissionsTable)
      .groupBy(formSubmissionsTable.status);

    const formsByTypeRows = await db
      .select({
        formType: formSubmissionsTable.formType,
        count: sql<number>`count(*)::int`,
      })
      .from(formSubmissionsTable)
      .groupBy(formSubmissionsTable.formType);

    const [totals] = await db
      .select({
        totalTaxDue: sql<number>`coalesce(sum(tax_due::numeric), 0)`,
        totalTaxPayable: sql<number>`coalesce(sum(tax_payable::numeric), 0)`,
      })
      .from(formSubmissionsTable);

    const formsByStatus: Record<string, number> = {};
    for (const row of formsByStatusRows) {
      formsByStatus[row.status] = row.count;
    }

    const formsByType: Record<string, number> = {};
    for (const row of formsByTypeRows) {
      formsByType[row.formType] = row.count;
    }

    res.json({
      totalForms,
      totalTaxpayers,
      formsByStatus,
      formsByType,
      totalTaxDue: Number(totals?.totalTaxDue ?? 0),
      totalTaxPayable: Number(totals?.totalTaxPayable ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get forms summary");
    res.status(500).json({ error: "Failed to get forms summary" });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = ListFormsQueryParams.parse(req.query);

    let dbQuery = db
      .select({
        id: formSubmissionsTable.id,
        taxpayerId: formSubmissionsTable.taxpayerId,
        formType: formSubmissionsTable.formType,
        taxableYear: formSubmissionsTable.taxableYear,
        taxablePeriod: formSubmissionsTable.taxablePeriod,
        taxablePeriodEnd: formSubmissionsTable.taxablePeriodEnd,
        grossIncome: formSubmissionsTable.grossIncome,
        allowableDeductions: formSubmissionsTable.allowableDeductions,
        taxableIncome: formSubmissionsTable.taxableIncome,
        taxDue: formSubmissionsTable.taxDue,
        taxWithheld: formSubmissionsTable.taxWithheld,
        taxPayable: formSubmissionsTable.taxPayable,
        penaltiesAndInterest: formSubmissionsTable.penaltiesAndInterest,
        totalAmountDue: formSubmissionsTable.totalAmountDue,
        status: formSubmissionsTable.status,
        filedDate: formSubmissionsTable.filedDate,
        remarks: formSubmissionsTable.remarks,
        formData: formSubmissionsTable.formData,
        createdAt: formSubmissionsTable.createdAt,
        updatedAt: formSubmissionsTable.updatedAt,
        taxpayer: {
          id: taxpayersTable.id,
          tin: taxpayersTable.tin,
          registeredName: taxpayersTable.registeredName,
          tradeName: taxpayersTable.tradeName,
          taxpayerType: taxpayersTable.taxpayerType,
          address: taxpayersTable.address,
          zipCode: taxpayersTable.zipCode,
          email: taxpayersTable.email,
          phone: taxpayersTable.phone,
          rdoCode: taxpayersTable.rdoCode,
          lineOfBusiness: taxpayersTable.lineOfBusiness,
          createdAt: taxpayersTable.createdAt,
          updatedAt: taxpayersTable.updatedAt,
        },
      })
      .from(formSubmissionsTable)
      .leftJoin(taxpayersTable, eq(formSubmissionsTable.taxpayerId, taxpayersTable.id))
      .$dynamic();

    const conditions = [];
    if (query.taxpayerId) {
      conditions.push(eq(formSubmissionsTable.taxpayerId, query.taxpayerId));
    }
    if (query.formType) {
      conditions.push(eq(formSubmissionsTable.formType, query.formType));
    }
    if (query.status) {
      conditions.push(
        eq(
          formSubmissionsTable.status,
          query.status as "draft" | "submitted" | "filed" | "amended"
        )
      );
    }

    if (conditions.length > 0) {
      const { and } = await import("drizzle-orm");
      dbQuery = dbQuery.where(and(...conditions)) as typeof dbQuery;
    }

    const forms = await dbQuery.orderBy(formSubmissionsTable.createdAt);
    res.json(forms);
  } catch (err) {
    req.log.error({ err }, "Failed to list forms");
    res.status(500).json({ error: "Failed to list forms" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = CreateFormSubmissionBody.parse(req.body);
    const [form] = await db.insert(formSubmissionsTable).values(data).returning();
    res.status(201).json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to create form submission");
    res.status(400).json({ error: "Failed to create form submission" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetFormSubmissionParams.parse(req.params);
    const [form] = await db
      .select({
        id: formSubmissionsTable.id,
        taxpayerId: formSubmissionsTable.taxpayerId,
        formType: formSubmissionsTable.formType,
        taxableYear: formSubmissionsTable.taxableYear,
        taxablePeriod: formSubmissionsTable.taxablePeriod,
        taxablePeriodEnd: formSubmissionsTable.taxablePeriodEnd,
        grossIncome: formSubmissionsTable.grossIncome,
        allowableDeductions: formSubmissionsTable.allowableDeductions,
        taxableIncome: formSubmissionsTable.taxableIncome,
        taxDue: formSubmissionsTable.taxDue,
        taxWithheld: formSubmissionsTable.taxWithheld,
        taxPayable: formSubmissionsTable.taxPayable,
        penaltiesAndInterest: formSubmissionsTable.penaltiesAndInterest,
        totalAmountDue: formSubmissionsTable.totalAmountDue,
        status: formSubmissionsTable.status,
        filedDate: formSubmissionsTable.filedDate,
        remarks: formSubmissionsTable.remarks,
        formData: formSubmissionsTable.formData,
        createdAt: formSubmissionsTable.createdAt,
        updatedAt: formSubmissionsTable.updatedAt,
        taxpayer: {
          id: taxpayersTable.id,
          tin: taxpayersTable.tin,
          registeredName: taxpayersTable.registeredName,
          tradeName: taxpayersTable.tradeName,
          taxpayerType: taxpayersTable.taxpayerType,
          address: taxpayersTable.address,
          zipCode: taxpayersTable.zipCode,
          email: taxpayersTable.email,
          phone: taxpayersTable.phone,
          rdoCode: taxpayersTable.rdoCode,
          lineOfBusiness: taxpayersTable.lineOfBusiness,
          createdAt: taxpayersTable.createdAt,
          updatedAt: taxpayersTable.updatedAt,
        },
      })
      .from(formSubmissionsTable)
      .leftJoin(taxpayersTable, eq(formSubmissionsTable.taxpayerId, taxpayersTable.id))
      .where(eq(formSubmissionsTable.id, id));

    if (!form) {
      res.status(404).json({ error: "Form submission not found" });
      return;
    }
    res.json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to get form submission");
    res.status(500).json({ error: "Failed to get form submission" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = UpdateFormSubmissionParams.parse(req.params);
    const data = UpdateFormSubmissionBody.parse(req.body);
    const [form] = await db
      .update(formSubmissionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(formSubmissionsTable.id, id))
      .returning();
    if (!form) {
      res.status(404).json({ error: "Form submission not found" });
      return;
    }
    res.json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to update form submission");
    res.status(400).json({ error: "Failed to update form submission" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteFormSubmissionParams.parse(req.params);
    const [deleted] = await db
      .delete(formSubmissionsTable)
      .where(eq(formSubmissionsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Form submission not found" });
      return;
    }
    res.json({ success: true, message: "Form submission deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete form submission");
    res.status(500).json({ error: "Failed to delete form submission" });
  }
});

export default router;
