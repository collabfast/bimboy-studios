import { Router, type IRouter } from "express";
import healthRouter from "./health";
import feedRouter from "./feed";
import creatorsRouter from "./creators";
import interactionsRouter from "./interactions";
import purchasesRouter from "./purchases";
import libraryRouter from "./library";
import analyticsRouter from "./analytics";
import earningsRouter from "./earnings";
import consentRouter from "./consent";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(feedRouter);
router.use(creatorsRouter);
router.use(interactionsRouter);
router.use(purchasesRouter);
router.use(libraryRouter);
router.use(analyticsRouter);
router.use(earningsRouter);
router.use(consentRouter);
router.use(storageRouter);

export default router;
