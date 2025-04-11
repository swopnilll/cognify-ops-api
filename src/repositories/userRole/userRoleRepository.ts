import { Prisma } from "@prisma/client";
import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";

export const insertUserRole = async (
  user_id: string,
  role_id: number,
  project_id: number,
  txClient: Prisma.TransactionClient = prisma
) => {
  try {
    const newUserRole = await txClient.user_Role.create({
      data: {
        user_id,
        role_id,
        project_id,
        updated_at: new Date(),
      },
    });

    logger.info(`New user role created for user ${user_id}, role ${role_id}, project ${project_id}`);
    return newUserRole;
  } catch (error) {
    logger.error(`Error creating user role for user ${user_id}, role ${role_id}, project ${project_id}: ${error.message}`);
    throw new Error(`Error creating user role: ${error.message}`);
  }
};

// Find User Role by user_id, role_id, and project_id
export const findUserRole = async (user_id: string, role_id: number, project_id: number) => {
  try {
    const userRole = await prisma.user_Role.findUnique({
      where: {
        user_id_role_id_project_id: {
          user_id,
          role_id,
          project_id,
        },
      },
    });

    if (!userRole) {
      logger.error(`User role not found for user ${user_id}, role ${role_id}, project ${project_id}`);
      throw new Error(`User role not found for user ${user_id}, role ${role_id}, project ${project_id}`);
    }

    return userRole;
  } catch (error) {
    logger.error(`Error finding user role for user ${user_id}, role ${role_id}, project ${project_id}: ${error.message}`);
    throw new Error(`Error finding user role: ${error.message}`);
  }
};

// Find all User Roles by project_id
export const findUserRolesByProject = async (project_id: number) => {
  try {
    const userRoles = await prisma.user_Role.findMany({
      where: { project_id },
    });

    if (!userRoles || userRoles.length === 0) {
      logger.warn(`No user roles found for project ${project_id}`);
    }

    return userRoles;
  } catch (error) {
    logger.error(`Error fetching user roles for project ${project_id}: ${error.message}`);
    throw new Error(`Error fetching user roles: ${error.message}`);
  }
};

// Find all User Roles by user_id
export const findUserRolesByUser = async (user_id: string) => {
  try {
    const userRoles = await prisma.user_Role.findMany({
      where: { user_id },
    });

    if (!userRoles || userRoles.length === 0) {
      logger.warn(`No user roles found for user ${user_id}`);
    }

    return userRoles;
  } catch (error) {
    logger.error(`Error fetching user roles for user ${user_id}: ${error.message}`);
    throw new Error(`Error fetching user roles: ${error.message}`);
  }
};
