import { Router, type IRouter } from "express";
import { prisma } from "@workspace/db";
import { CreateTaxpayerBody, UpdateTaxpayerBody, TaxpayerIdParam } from "../schemas/index.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const taxpayers = await prisma.taxpayer.findMany({ orderBy: { createdAt: "asc" } });
    res.json(taxpayers);
  } catch (err) {
    req.log.error({ err }, "Failed to list taxpayers");
    res.status(500).json({ error: "Failed to list taxpayers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = CreateTaxpayerBody.parse(req.body);
    const taxpayer = await prisma.taxpayer.create({ data });
    res.status(201).json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to create taxpayer");
    res.status(400).json({ error: "Failed to create taxpayer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = TaxpayerIdParam.parse(req.params);
    const taxpayer = await prisma.taxpayer.findUnique({ where: { id } });
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
    const data = UpdateTaxpayerBody.parse(req.body);
    const taxpayer = await prisma.taxpayer.update({ where: { id }, data });
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

export default router;
