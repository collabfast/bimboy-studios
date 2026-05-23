import { Router, type IRouter } from "express";
import healthRouter from "./health";
import feedRouter from "./feed";
import creatorsRouter from "./creators";
import interactionsRouter from "./interactions";
import purchasesRouter from "./purchases";

const router: IRouter = Router();

router.use(healthRouter);
router.use(feedRouter);
router.use(creatorsRouter);
router.use(interactionsRouter);
router.use(purchasesRouter);

export default router;
