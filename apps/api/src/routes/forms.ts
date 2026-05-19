import { Router, type IRouter } from "express";
import { prisma } from "@workspace/db";
import { CreateFormBody, UpdateFormBody, FormIdParam, ListFormsQuery } from "../schemas/index.js";

const router: IRouter = Router();

router.get("/stats/summary", async (req, res) => {
  try {
    const [totalForms, totalTaxpayers, byStatusRaw, byTypeRaw, totals, formsWithRdo] =
      await Promise.all([
        prisma.formSubmission.count(),
        prisma.taxpayer.count(),
        prisma.formSubmission.groupBy({ by: ["status"], _count: { id: true } }),
        prisma.formSubmission.groupBy({ by: ["formType"], _count: { id: true } }),
        prisma.formSubmission.aggregate({
          _sum: { taxDue: true, taxPayable: true },
        }),
        prisma.formSubmission.findMany({
          select: { taxpayer: { select: { rdoCode: true } } },
        }),
      ]);

    const byStatus = Object.fromEntries(
      byStatusRaw.map((r) => [r.status, r._count.id]),
    );
    const byType = Object.fromEntries(
      byTypeRaw.map((r) => [r.formType, r._count.id]),
    );
    const byRdo: Record<string, number> = {};
    for (const { taxpayer } of formsWithRdo) {
      const key = String(taxpayer.rdoCode);
      byRdo[key] = (byRdo[key] ?? 0) + 1;
    }

    res.json({
      total: totalForms,
      totalTaxpayers,
      byStatus,
      byType,
      byRdo,
      totalTaxDue: totals._sum.taxDue ?? 0,
      totalTaxPayable: totals._sum.taxPayable ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get forms summary");
    res.status(500).json({ error: "Failed to get forms summary" });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = ListFormsQuery.parse(req.query);
    const forms = await prisma.formSubmission.findMany({
      where: {
        ...(query.taxpayerId !== undefined && { taxpayerId: query.taxpayerId }),
        ...(query.formType !== undefined && { formType: query.formType }),
        ...(query.status !== undefined && { status: query.status }),
      },
      include: { taxpayer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(forms);
  } catch (err) {
    req.log.error({ err }, "Failed to list forms");
    res.status(500).json({ error: "Failed to list forms" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { filedDate, ...rest } = CreateFormBody.parse(req.body);
    const form = await prisma.formSubmission.create({
      data: {
        ...rest,
        ...(filedDate !== undefined && { filedDate: new Date(filedDate) }),
      },
    });
    res.status(201).json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to create form");
    res.status(400).json({ error: "Failed to create form" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = FormIdParam.parse(req.params);
    const form = await prisma.formSubmission.findUnique({
      where: { id },
      include: { taxpayer: true },
    });
    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    res.json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to get form");
    res.status(500).json({ error: "Failed to get form" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = FormIdParam.parse(req.params);
    const { filedDate, ...rest } = UpdateFormBody.parse(req.body);
    const form = await prisma.formSubmission.update({
      where: { id },
      data: {
        ...rest,
        ...(filedDate !== undefined && { filedDate: new Date(filedDate) }),
      },
    });
    res.json(form);
  } catch (err) {
    req.log.error({ err }, "Failed to update form");
    res.status(400).json({ error: "Failed to update form" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = FormIdParam.parse(req.params);
    await prisma.formSubmission.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete form");
    res.status(500).json({ error: "Failed to delete form" });
  }
});

export default router;
