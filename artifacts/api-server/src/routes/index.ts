import { Router, type IRouter } from "express";
import healthRouter from "./health";
import taxpayersRouter from "./taxpayers";
import formsRouter from "./forms";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/taxpayers", taxpayersRouter);
router.use("/forms", formsRouter);

export default router;
