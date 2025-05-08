// src/routes/openaiRoutes.ts
import { Router } from 'express';
import { streamAnswer } from '../../controllers/intellecta/openaiController';


const router = Router();

router.post('/chat', streamAnswer);

export default router;
