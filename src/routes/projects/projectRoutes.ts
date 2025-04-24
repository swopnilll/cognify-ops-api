import { Router, Request, Response } from 'express';
import {  createProjectController, getProjectsController, getProjectsForUserController, updateProjectController } from '../../controllers/projects/projectController';
import { handleValidationErrors, validateCreateProjectPayload } from '../../middleware/project/validateCreateProjectPayload';
import { updateProject } from '../../repositories/project/projectRepository';

const projectRoutes = Router();

projectRoutes.get('/', getProjectsController);

projectRoutes.get('/:userId', getProjectsForUserController);

projectRoutes.post('/', validateCreateProjectPayload, handleValidationErrors, createProjectController);  

projectRoutes.patch('/:projectId', updateProjectController);


export default projectRoutes;