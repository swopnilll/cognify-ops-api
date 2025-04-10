import { Router, Request, Response } from 'express';
import {  createProjectController, getProjectsController } from '../../controllers/projects/projectController';
import { handleValidationErrors, validateCreateProjectPayload } from '../../middleware/project/validateCreateProjectPayload';

const projectRoutes = Router();

projectRoutes.get('/', getProjectsController);

projectRoutes.post('/', validateCreateProjectPayload, handleValidationErrors, createProjectController);        

export default projectRoutes;