import { Router, Request, Response } from 'express';

const projectRoutes = Router();

projectRoutes.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Project routes are working'});
});         

export default projectRoutes;