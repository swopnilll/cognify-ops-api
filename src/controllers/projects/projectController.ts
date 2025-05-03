import { Request, RequestHandler, Response } from "express";
import { addUsersToProjectService, addUserToProjectSevice, createProject, getAllAvailableUsersListService, getAllProjects, getProjectsForUser, getUsersForProjectService, updateProjectService } from "../../services/project/projectService";
import logger from "../../utils/logger";

export const createProjectController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info(req);

    const newProject = await createProject(req.body);

    res.status(201).json(newProject);
  } catch (error) {
    logger.info(error);
    res.status(500).json({ message: error.message });
  }
};

export const getProjectsController: RequestHandler = async (req: Request, res: Response) => {
    try {
      const projects = await getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  export const getProjectsForUserController: RequestHandler = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const projects = await getProjectsForUser(userId);
      res.status(200).json(projects);
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

export const updateProjectController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = Number(req.params.projectId);

    if (isNaN(projectId)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }

    const updatedProject = await updateProjectService(projectId, req.body);

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAvailableUsersListController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const users = await getAllAvailableUsersListService();

    res.status(200).json(users);
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export const addUserToProjectController: RequestHandler = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const { userId } = req.body;

  if (isNaN(projectId) || !userId) {
     res.status(400).json({ message: "Invalid projectId or userId" });
  }

  try {
    const result = await addUserToProjectSevice({ userId }, projectId);

    if (result.status) {
       res.status(201).json({ message: result.reason });
    } else {
       res.status(409).json({ message: result.reason }); // 409 Conflict if user already exists
    }

  } catch (error) {
    logger.error(`Controller error: ${error.message}`);
     res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addUsersToProjectController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId, 10);
  const { userIdList } = req.body;

  // Basic validation
  if (!Array.isArray(userIdList) || userIdList.length === 0) {
     res.status(400).json({ error: 'userIdList must be a non-empty array' });
  }

  if (isNaN(projectId)) {
     res.status(400).json({ error: 'Invalid projectId parameter' });
  }

  try {
    const result = await addUsersToProjectService(userIdList, projectId);
     res.status(200).json(result);
  } catch (error) {
    console.error(`Controller error: ${error.message}`);
     res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsersForProjectController: RequestHandler = async (req: Request, res: Response) => {
  try{
    const projectId = Number(req.params.projectId);
    console.log({projectId});

    const users = await getUsersForProjectService(projectId);

    res.status(200).json(users);
  }catch(error){
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}