import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";


export const findProjectById = async (projectId: number) => {
  try {
    const project = await prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) {
      logger.error(`Project with ID ${projectId} not found.`);
      throw new Error(`Project with ID ${projectId} not found.`);
    }
    return project;
  } catch (error) {
    logger.error(`Error finding project with ID ${projectId}: ${error.message}`);
    throw new Error(`Error finding project: ${error.message}`);
  }
};

export const findAllProjects = async () => {
  try {
    const projects = await prisma.project.findMany();
    if (!projects || projects.length === 0) {
      logger.warn('No projects found.');
    }
    return projects;
  } catch (error) {
    logger.error(`Error fetching all projects: ${error.message}`);
    throw new Error(`Error fetching projects: ${error.message}`);
  }
};

export const insertProject = async (data: { name: string; description: string; created_by: string; project_key: string }) => {
  try {
    const newProject = await prisma.project.create({ data });
    logger.info(`New project created with ID ${newProject.project_id}`);
    return newProject;
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    throw new Error(`Error creating project: ${error.message}`);
  }
};
