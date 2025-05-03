import { Request, RequestHandler, Response } from "express";
import { createProject, getAllAvailableUsersListService, getAllProjects, getProjectsForUser, updateProjectService } from "../../services/project/projectService";
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