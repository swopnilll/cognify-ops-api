import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";

// Find Project User by project_id and user_id
export const findProjectUser = async (project_id: number, user_id: string) => {
  try {
    const projectUser = await prisma.project_User.findUnique({
      where: {
        project_id_user_id: {
          project_id,
          user_id,
        },
      },
    });

    if (!projectUser) {
      logger.error(`Project User not found for project ${project_id}, user ${user_id}`);
      throw new Error(`Project User not found for project ${project_id}, user ${user_id}`);
    }

    return projectUser;
  } catch (error) {
    logger.error(`Error finding project user for project ${project_id}, user ${user_id}: ${error.message}`);
    throw new Error(`Error finding project user: ${error.message}`);
  }
};

// Find all Project Users by project_id
export const findProjectUsersByProject = async (project_id: number) => {
  try {
    const projectUsers = await prisma.project_User.findMany({
      where: { project_id },
    });

    if (!projectUsers || projectUsers.length === 0) {
      logger.warn(`No users found for project ${project_id}`);
    }

    return projectUsers;
  } catch (error) {
    logger.error(`Error fetching users for project ${project_id}: ${error.message}`);
    throw new Error(`Error fetching project users: ${error.message}`);
  }
};

// Find all Project Users by user_id
export const findProjectUsersByUser = async (user_id: string) => {
  try {
    const projectUsers = await prisma.project_User.findMany({
      where: { user_id },
    });

    if (!projectUsers || projectUsers.length === 0) {
      logger.warn(`No projects found for user ${user_id}`);
    }

    return projectUsers;
  } catch (error) {
    logger.error(`Error fetching projects for user ${user_id}: ${error.message}`);
    throw new Error(`Error fetching project users: ${error.message}`);
  }
};

// Insert a new Project User
export const insertProjectUser = async (project_id: number, user_id: string) => {
  try {
    const newProjectUser = await prisma.project_User.create({
      data: {
        project_id,
        user_id,
        updated_at: new Date(),
      },
    });

    logger.info(`New project user created for project ${project_id}, user ${user_id}`);
    return newProjectUser;
  } catch (error) {
    logger.error(`Error creating project user for project ${project_id}, user ${user_id}: ${error.message}`);
    throw new Error(`Error creating project user: ${error.message}`);
  }
};

// Update the updated_at timestamp for a specific Project User
export const updateProjectUserTimestamp = async (project_id: number, user_id: string) => {
  try {
    const updatedProjectUser = await prisma.project_User.update({
      where: {
        project_id_user_id: {
          project_id,
          user_id,
        },
      },
      data: {
        updated_at: new Date(),
      },
    });

    logger.info(`Updated timestamp for project user: project ${project_id}, user ${user_id}`);
    return updatedProjectUser;
  } catch (error) {
    logger.error(`Error updating timestamp for project user: project ${project_id}, user ${user_id}: ${error.message}`);
    throw new Error(`Error updating project user timestamp: ${error.message}`);
  }
};
