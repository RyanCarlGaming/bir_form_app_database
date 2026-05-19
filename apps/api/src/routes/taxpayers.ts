import { Router, type IRouter } from "express";
import { prisma } from "@workspace/db";
import {
  CreateTaxpayerBody,
  UpdateTaxpayerBody,
  TaxpayerIdParam,
  ListTaxpayersQuery,
  CreateSpouseBody,
  CreateEmployerBody,
  CreateDependentBody,
} from "../schemas/index.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListTaxpayersQuery.parse(req.query);
    const taxpayers = await prisma.taxpayer.findMany({
      where: {
        ...(query.rdoCode !== undefined && { rdoCode: query.rdoCode }),
        ...(query.taxpayerType !== undefined && { taxpayerType: query.taxpayerType }),
      },
      include: { spouse: true, employers: true, dependents: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(taxpayers);
  } catch (err) {
    req.log.error({ err }, "Failed to list taxpayers");
    res.status(500).json({ error: "Failed to list taxpayers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { birRegDate, dateOfBirth, idEffectivity, idExpiry, ...rest } =
      CreateTaxpayerBody.parse(req.body);
    const taxpayer = await prisma.taxpayer.create({
      data: {
        ...rest,
        birRegDate:    new Date(birRegDate),
        dateOfBirth:   new Date(dateOfBirth),
        idEffectivity: new Date(idEffectivity),
        idExpiry:      new Date(idExpiry),
      },
    });
    res.status(201).json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to create taxpayer");
    res.status(400).json({ error: "Failed to create taxpayer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { id },
      include: { spouse: true, employers: true, dependents: true, formSubmissions: true },
    });
    if (!taxpayer) {
      res.status(404).json({ error: "Taxpayer not found" });
      return;
    }
    res.json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to get taxpayer");
    res.status(500).json({ error: "Failed to get taxpayer" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const { birRegDate, dateOfBirth, idEffectivity, idExpiry, ...rest } =
      UpdateTaxpayerBody.parse(req.body);
    const taxpayer = await prisma.taxpayer.update({
      where: { id },
      data: {
        ...rest,
        ...(birRegDate    !== undefined && { birRegDate:    new Date(birRegDate) }),
        ...(dateOfBirth   !== undefined && { dateOfBirth:   new Date(dateOfBirth) }),
        ...(idEffectivity !== undefined && { idEffectivity: new Date(idEffectivity) }),
        ...(idExpiry      !== undefined && { idExpiry:      new Date(idExpiry) }),
      },
    });
    res.json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to update taxpayer");
    res.status(400).json({ error: "Failed to update taxpayer" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    await prisma.taxpayer.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete taxpayer");
    res.status(500).json({ error: "Failed to delete taxpayer" });
  }
});

// ── Spouse ────────────────────────────────────────────────────────────────────

router.get("/:id/spouse", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const spouse = await prisma.spouse.findUnique({ where: { taxpayerId: id } });
    if (!spouse) {
      res.status(404).json({ error: "Spouse not found" });
      return;
    }
    res.json(spouse);
  } catch (err) {
    req.log.error({ err }, "Failed to get spouse");
    res.status(500).json({ error: "Failed to get spouse" });
  }
});

router.post("/:id/spouse", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const data = CreateSpouseBody.parse(req.body);
    const spouse = await prisma.spouse.upsert({
      where:  { taxpayerId: id },
      create: { ...data, taxpayerId: id },
      update: data,
    });
    res.status(201).json(spouse);
  } catch (err) {
    req.log.error({ err }, "Failed to create/update spouse");
    res.status(400).json({ error: "Failed to create/update spouse" });
  }
});

// ── Employers ─────────────────────────────────────────────────────────────────

router.get("/:id/employers", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const employers = await prisma.employer.findMany({ where: { taxpayerId: id } });
    res.json(employers);
  } catch (err) {
    req.log.error({ err }, "Failed to list employers");
    res.status(500).json({ error: "Failed to list employers" });
  }
});

router.post("/:id/employers", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const { hireDate, ...rest } = CreateEmployerBody.parse(req.body);
    const employer = await prisma.employer.create({
      data: { ...rest, hireDate: new Date(hireDate), taxpayerId: id },
    });
    res.status(201).json(employer);
  } catch (err) {
    req.log.error({ err }, "Failed to create employer");
    res.status(400).json({ error: "Failed to create employer" });
  }
});

// ── Dependents ────────────────────────────────────────────────────────────────

router.get("/:id/dependents", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const dependents = await prisma.dependent.findMany({ where: { taxpayerId: id } });
    res.json(dependents);
  } catch (err) {
    req.log.error({ err }, "Failed to list dependents");
    res.status(500).json({ error: "Failed to list dependents" });
  }
});

router.post("/:id/dependents", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const { dateOfBirth, ...rest } = CreateDependentBody.parse(req.body);
    const dependent = await prisma.dependent.create({
      data: { ...rest, dateOfBirth: new Date(dateOfBirth), taxpayerId: id },
    });
    res.status(201).json(dependent);
  } catch (err) {
    req.log.error({ err }, "Failed to create dependent");
    res.status(400).json({ error: "Failed to create dependent" });
  }
});

export default router;
