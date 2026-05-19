import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import taxpayersRouter from "./taxpayers.js";
import formsRouter from "./forms.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/taxpayers", taxpayersRouter);
router.use("/forms", formsRouter);

export default router;
