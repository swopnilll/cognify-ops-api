import {
  addUsersToProjectRepository,
  addUserToProjectRepository,
  createFullProject,
  findAllProjects,
  findProjectsByUserId,
  updateProject,
} from "../../repositories/project/projectRepository";
import { fetchRoleIdByRoleName } from "../role/roleService";

import logger from "../../utils/logger";
import { getAllAuth0Users, getAuth0UsersByIds } from "../../repositories/auth/authRepository";
import { findUserRolesByProject } from "../../repositories/userRole/userRoleRepository";
import { createTicketAndAssignToUserRepo } from "../../repositories/ticket/ticketRepository";
import { HttpError } from "../../utils/httpError";

type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
  user_id: string;
  project_key: string;
};

type AddUserToProjectPayload = {
  userId: string;
  userRoleId: string;
}

export const createProject = async (data: CreateProjectInput) => {
  try {
    logger.info("createProject called");
    let adminRoleId = await fetchRoleIdByRoleName("admin");

    logger.info("role name", adminRoleId);
    logger.info(adminRoleId);

    const newProject = await createFullProject({
      name: data.name,
      description: data.description,
      project_key: data.project_key,
      user_id: data.user_id,
      role_id: adminRoleId,
    });

    logger.info(`New project created with ID ${newProject.project_id}`);
    return newProject;
  } catch (error) {
    // Log the error if something goes wrong
    logger.error(`Error creating project: ${error.message}`);
    throw new Error(`Error creating project: ${error.message}`);
  }
};

export const getAllProjects = async () => {
  try {
    const projects = await findAllProjects();
    if (!projects || projects.length === 0) {
      logger.warn("No projects found in the service layer.");
    }
    return projects;
  } catch (error) {
    logger.error(
      `Error fetching all projects in service layer: ${error.message}`
    );
    throw new Error(
      `Error fetching projects in service layer: ${error.message}`
    );
  }
};

export const getProjectsForUser = async (userId: string) => {
  try {
    const projects = await findProjectsByUserId(userId);
    if (!projects || projects.length === 0) {
      logger.warn(`No projects found for user ID ${userId} in the service layer.`);
    }
    return projects;
  } catch (error) {
    logger.error(
      `Error fetching projects for user ID ${userId} in service layer: ${error.message}`
    );
    throw new Error(
      `Error fetching projects for user in service layer: ${error.message}`
    );
  }
}

export const updateProjectService = async (
  projectId: number,
  data: { name?: string; description?: string; project_key?: string }
) => {
  try {
    return await updateProject(projectId, data);
  } catch (error) {
    logger.error(`Error updating project in service layer: ${error.message}`);
    throw new Error(`Error updating project: ${error.message}`);
  }
};

export const getAllAvailableUsersListService = async () => {
  try {
    const usersFromAuth0 = await getAllAuth0Users();

    const filteredUsers = usersFromAuth0.map(user => ({
      email: user.email,
      picture: user.picture,
      user_id: user.user_id,
      name: user?.user_metadata?.fullName || "",
      last_login: user.last_login,
      date_added: user.created_at
    }));

    return filteredUsers;
  } catch (error) {
    logger.error(`Error getting all users in service layer: ${error.message}`);
    throw new Error(`Error getting users ${error.message}`);
  }
};

export const addUserToProjectSevice = async (details, projectId) => {
  try{
    return await addUserToProjectRepository(details, projectId);
  } catch(error){
    logger.error(`Service error adding user to project: ${error.message}`);
    throw new Error(`Error adding users ${error.message}`);
  }
}

export const addUsersToProjectService = async (userIdList: string[], projectId: number) => {
  // You can add any business logic here if needed later (e.g., role validation)

  const result = await addUsersToProjectRepository(userIdList, projectId);
  return result;
};

export const getUsersForProjectService = async (projectId) => {
  try {
    const users = await findUserRolesByProject(projectId);

    if (users.length === 0) {
      return []; // No users in project, return empty array early
    }

    const userIds = users.map(user => user.user_id);

    const userDetails = await getAuth0UsersByIds(userIds);

    // Create a map from user_id to role_id for quick lookup
    const roleMap = new Map();
    users.forEach(user => {
      roleMap.set(user.user_id, user.role_id);
    });

    // Combine Auth0 user info + role_id
    const combinedUsers = userDetails.map(user => ({
      ...user,
      role_id: roleMap.get(user.user_id) ?? null, // Add role_id, null if not found (shouldn't happen)
    }));

    return combinedUsers;
  } catch (error) {
    logger.error(`Error fetching users for project in service layer: ${error.message}`);
    throw new Error(`Error fetching users: ${error.message}`);
  }
};