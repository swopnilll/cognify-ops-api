
import { findUserRole, findUserRolesByUser, insertUserRole } from "../../repositories/userRole/userRoleRepository";
import logger from "../../utils/logger";

// Find a specific user role by user_id and role_id
export const getUserRole = async (user_id: string, role_id: number, project_id: number) => {
  try {
    const userRole = await findUserRole(user_id, role_id, project_id);
    return userRole;
  } catch (error) {
    logger.error(`Error in UserRoleService - getUserRole: ${error.message}`);
    throw error; // Propagate error to the controller
  }
};

// Get all roles for a specific user
export const getUserRoles = async (user_id: string) => {
  try {
    const userRoles = await findUserRolesByUser(user_id);
    return userRoles;
  } catch (error) {
    logger.error(`Error in UserRoleService - getUserRoles: ${error.message}`);
    throw error;
  }
};

// Create a new user role
export const createUserRole = async (user_id: string, role_id: number, project_id: number) => {
  try {
    const userRole = await insertUserRole(user_id, role_id, project_id);
    return userRole;
  } catch (error) {
    logger.error(`Error in UserRoleService - createUserRole: ${error.message}`);
    throw error;
  }
};
