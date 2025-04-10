import { Request, RequestHandler, Response } from "express";
import { createProject, getAllProjects } from "../../services/project/projectService";
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