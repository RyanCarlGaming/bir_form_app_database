import { Router, type IRouter } from "express";
import { db, taxpayersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateTaxpayerBody,
  UpdateTaxpayerBody,
  GetTaxpayerParams,
  UpdateTaxpayerParams,
  DeleteTaxpayerParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const taxpayers = await db.select().from(taxpayersTable).orderBy(taxpayersTable.createdAt);
    res.json(taxpayers);
  } catch (err) {
    req.log.error({ err }, "Failed to list taxpayers");
    res.status(500).json({ error: "Failed to list taxpayers" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = CreateTaxpayerBody.parse(req.body);
    const [taxpayer] = await db.insert(taxpayersTable).values(data).returning();
    res.status(201).json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to create taxpayer");
    res.status(400).json({ error: "Failed to create taxpayer" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetTaxpayerParams.parse(req.params);
    const [taxpayer] = await db.select().from(taxpayersTable).where(eq(taxpayersTable.id, id));
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
    const { id } = UpdateTaxpayerParams.parse(req.params);
    const data = UpdateTaxpayerBody.parse(req.body);
    const [taxpayer] = await db
      .update(taxpayersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxpayersTable.id, id))
      .returning();
    if (!taxpayer) {
      res.status(404).json({ error: "Taxpayer not found" });
      return;
    }
    res.json(taxpayer);
  } catch (err) {
    req.log.error({ err }, "Failed to update taxpayer");
    res.status(400).json({ error: "Failed to update taxpayer" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteTaxpayerParams.parse(req.params);
    const [deleted] = await db
      .delete(taxpayersTable)
      .where(eq(taxpayersTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Taxpayer not found" });
      return;
    }
    res.json({ success: true, message: "Taxpayer deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete taxpayer");
    res.status(500).json({ error: "Failed to delete taxpayer" });
  }
});

export default router;
