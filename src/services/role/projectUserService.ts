import { findProjectUser, findProjectUsersByProject, findProjectUsersByUser, insertProjectUser } from "../../repositories/projectUser/projectUserRepository";
import logger from "../../utils/logger";

// Get project user roles by project_id and user_id
export const getProjectUserRole = async (project_id: number, user_id: string) => {
  try {
    const projectUserRole = await findProjectUser(project_id, user_id);
    return projectUserRole;
  } catch (error) {
    logger.error(`Error in ProjectUserRoleService - getProjectUserRole: ${error.message}`);
    throw error;
  }
};

// Get all project user roles by project_id
export const getProjectUserRolesByProject = async (project_id: number) => {
  try {
    const projectUserRoles = await findProjectUsersByProject(project_id);
    return projectUserRoles;
  } catch (error) {
    logger.error(`Error in ProjectUserRoleService - getProjectUserRolesByProject: ${error.message}`);
    throw error;
  }
};

// Get all project user roles by user_id
export const getProjectUserRolesByUser = async (user_id: string) => {
  try {
    const projectUserRoles = await findProjectUsersByUser(user_id);
    return projectUserRoles;
  } catch (error) {
    logger.error(`Error in ProjectUserRoleService - getProjectUserRolesByUser: ${error.message}`);
    throw error;
  }
};

// Create a new project user role
export const createProjectUserRole = async (project_id: number, user_id: string) => {
  try {
    const projectUserRole = await insertProjectUser(project_id, user_id);
    return projectUserRole;
  } catch (error) {
    logger.error(`Error in ProjectUserRoleService - createProjectUserRole: ${error.message}`);
    throw error;
  }
};
