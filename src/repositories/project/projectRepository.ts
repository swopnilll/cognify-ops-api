import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";
import { insertProjectUser } from "../projectUser/projectUserRepository";
import { insertUserRole } from "../userRole/userRoleRepository";

type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
  user_id: string;
  project_key: string;
};

export const createFullProject = async (data: {
  name: string;
  description: string;
  project_key: string;
  user_id: string;
  role_id: number;
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      try {
        const project = await tx.project.create({
          data: {
            name: data.name,
            description: data.description,
            project_key: data.project_key,
            created_by: data.user_id,
          },
        });

        try {
          await insertUserRole(data.user_id, data.role_id, project.project_id, tx);
        } catch (userRoleError) {
          logger.error(`Failed to create user role: ${userRoleError.message}`);
          throw userRoleError;
        }

        try {
          await insertProjectUser(project.project_id, data.user_id, tx);
        } catch (projectUserError) {
          logger.error(`Failed to create project user: ${projectUserError.message}`);
          throw projectUserError;
        }

        return project;
      } catch (transactionError) {
        logger.error(`Transaction failed: ${transactionError.message}`);
        throw transactionError; // triggers rollback
      }
    });
  } catch (error) {
    logger.error(`createFullProject failed: ${error.message}`);
    throw new Error(`createFullProject failed: ${error.message}`);
  }
};


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
