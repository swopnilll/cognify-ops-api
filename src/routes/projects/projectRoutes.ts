import { Router } from 'express';
import {  addUsersToProjectController, addUserToProjectController, createProjectController, getAllAvailableUsersListController, getProjectsController, getProjectsForUserController, getUsersForProjectController, updateProjectController } from '../../controllers/projects/projectController';
import { handleValidationErrors, validateCreateProjectPayload } from '../../middleware/project/validateCreateProjectPayload';

const projectRoutes = Router();

projectRoutes.get('/', getProjectsController);

projectRoutes.post('/', validateCreateProjectPayload, handleValidationErrors, createProjectController);  

projectRoutes.get('/users/available', getAllAvailableUsersListController);

projectRoutes.post('/:projectId/user', addUserToProjectController);
projectRoutes.post('/:projectId/users', addUsersToProjectController);

projectRoutes.get('/:projectId/users', getUsersForProjectController);

projectRoutes.get('/:userId', getProjectsForUserController);

projectRoutes.patch('/:projectId', updateProjectController);


export default projectRoutes;