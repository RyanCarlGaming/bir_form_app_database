import { Router, type IRouter } from "express";
import { prisma } from "@workspace/db";
import { CreateApplicationBody } from "../schemas/index.js";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const body = CreateApplicationBody.parse(req.body);
    const { birRegDate, dateOfBirth, idEffectivity, idExpiry, ...taxpayerRest } = body.taxpayer;

    const [taxpayer, form] = await prisma.$transaction(async (tx) => {
      const tp = await tx.taxpayer.create({
        data: {
          ...taxpayerRest,
          birRegDate:    new Date(birRegDate),
          dateOfBirth:   new Date(dateOfBirth),
          idEffectivity: new Date(idEffectivity),
          idExpiry:      new Date(idExpiry),
        },
      });

      if (body.spouse) {
        await tx.spouse.create({ data: { ...body.spouse, taxpayerId: tp.id } });
      }

      for (const { hireDate, ...emp } of body.employers) {
        await tx.employer.create({
          data: { ...emp, hireDate: new Date(hireDate), taxpayerId: tp.id },
        });
      }

      for (const { dateOfBirth: dob, ...dep } of body.dependents) {
        await tx.dependent.create({
          data: { ...dep, dateOfBirth: new Date(dob), taxpayerId: tp.id },
        });
      }

      const fm = await tx.formSubmission.create({
        data: { ...body.form, taxpayerId: tp.id },
      });

      return [tp, fm] as const;
    });

    res.status(201).json({ taxpayerId: taxpayer.id, formId: form.id });
  } catch (err) {
    req.log.error({ err }, "Failed to create application");
    res.status(400).json({ error: "Failed to create application" });
  }
});

export default router;
