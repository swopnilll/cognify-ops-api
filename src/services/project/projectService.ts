import {
  createFullProject,
  findAllProjects,
} from "../../repositories/project/projectRepository";
import { fetchRoleIdByRoleName } from "../role/roleService";

import logger from "../../utils/logger";

type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
  user_id: string;
  project_key: string;
};

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
