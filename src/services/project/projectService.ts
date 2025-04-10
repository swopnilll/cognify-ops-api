import { findAllProjects, insertProject } from "../../repositories/project/projectRepository";
import logger from "../../utils/logger";

import { fetchRoleIdByRoleName } from "../role/roleService";


type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
  created_by: string;
};

export const createProject = async (data: CreateProjectInput) => {
  try {
    // const newProject = await insertProject({ 
    //   name: data.name, 
    //   description: data.description || '', 
    //   created_by: data.userId 
    // });


    logger.info("createProject called")
    let adminRoleId = await fetchRoleIdByRoleName("admin");

    logger.info("role name", adminRoleId)
    logger.info(adminRoleId)

    let newProject;
    // Log success after project creation
    // logger.info(`New project created with ID ${newProject.project_id}`);
    
    // Return the newly created project
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
      logger.warn('No projects found in the service layer.');
    }
    return projects;
  } catch (error) {
    logger.error(`Error fetching all projects in service layer: ${error.message}`);
    throw new Error(`Error fetching projects in service layer: ${error.message}`);
  }
};
