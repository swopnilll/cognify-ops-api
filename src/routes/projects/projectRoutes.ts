import { Router } from 'express';
import {  addUserToProjectController, createProjectController, getAllAvailableUsersListController, getProjectsController, getProjectsForUserController, getUsersForProjectController, updateProjectController } from '../../controllers/projects/projectController';
import { handleValidationErrors, validateCreateProjectPayload } from '../../middleware/project/validateCreateProjectPayload';

const projectRoutes = Router();

projectRoutes.get('/', getProjectsController);

projectRoutes.post('/', validateCreateProjectPayload, handleValidationErrors, createProjectController);  

projectRoutes.get('/users/available', getAllAvailableUsersListController);

projectRoutes.post('/:projectId/users', addUserToProjectController);

projectRoutes.get('/:projectId/users', getUsersForProjectController);

projectRoutes.get('/:userId', getProjectsForUserController);

projectRoutes.patch('/:projectId', updateProjectController);


export default projectRoutes;