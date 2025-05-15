// src/routes/openaiRoutes.ts
import { Router } from "express";
import { streamAnswer } from "../../controllers/intellecta/openaiController";

import { queryController } from "../../controllers/intellecta/aiQueryController";

const router = Router();

router.post("/chat", streamAnswer);
router.post("/askintellecta", queryController);

export default router;
