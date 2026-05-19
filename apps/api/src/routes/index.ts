import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import taxpayersRouter from "./taxpayers.js";
import formsRouter from "./forms.js";
import applicationsRouter from "./applications.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/taxpayers", taxpayersRouter);
router.use("/forms", formsRouter);
router.use("/applications", applicationsRouter);

export default router;
