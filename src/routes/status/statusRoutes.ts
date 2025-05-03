import { Router } from 'express';

import { getStatusController } from '../../controllers/status/statusController';

const statusRoutes = Router();

statusRoutes.get("/", getStatusController)

export default statusRoutes;