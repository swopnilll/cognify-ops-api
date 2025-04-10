import { Router, Request, Response } from 'express';

const healthRoutes = Router();

healthRoutes.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(), // How long the server has been up
    timestamp: new Date().toISOString()
  });
});

export default healthRoutes;
