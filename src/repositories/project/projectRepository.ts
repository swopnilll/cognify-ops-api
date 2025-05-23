import prisma from "../../db/prismaClient";
import logger from "../../utils/logger";
import { checkIfUserExistsInProjectUser, insertProjectUser } from "../projectUser/projectUserRepository";
import { checkIfUserExistsInProject, findUserRolesByUser, insertUserRole } from "../userRole/userRoleRepository";

type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
  user_id: string;
  project_key: string;
};

type UpdateProjectInput = {
    name?: string;
    description?: string;
    project_key?: string;
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
          await insertUserRole(
            data.user_id,
            data.role_id,
            project.project_id,
            tx
          );
        } catch (userRoleError) {
          logger.error(`Failed to create user role: ${userRoleError.message}`);
          throw userRoleError;
        }

        try {
          await insertProjectUser(project.project_id, data.user_id, tx);
        } catch (projectUserError) {
          logger.error(
            `Failed to create project user: ${projectUserError.message}`
          );
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
    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
    });
    if (!project) {
      logger.error(`Project with ID ${projectId} not found.`);
      throw new Error(`Project with ID ${projectId} not found.`);
    }
    return project;
  } catch (error) {
    logger.error(
      `Error finding project with ID ${projectId}: ${error.message}`
    );
    throw new Error(`Error finding project: ${error.message}`);
  }
};

export const findAllProjects = async () => {
  try {
    const projects = await prisma.project.findMany();
    if (!projects || projects.length === 0) {
      logger.warn("No projects found.");
    }
    return projects;
  } catch (error) {
    logger.error(`Error fetching all projects: ${error.message}`);
    throw new Error(`Error fetching projects: ${error.message}`);
  }
};

export const findProjectsByUserId = async (userId: string) => {
  try{

    return await prisma.$transaction(async (tx) => {
      try {
        const userRoles = await findUserRolesByUser(userId);

        if (!userRoles || userRoles.length === 0) {
          logger.warn(`No user roles found for user ID ${userId}`);
          return [];
        }

        const projectIds = userRoles.map((userRole) => userRole.project_id);

        const projects = await tx.project.findMany({
          where: {
            project_id: {
              in: projectIds,
            },
          },
        });

        if (!projects || projects.length === 0) {
          logger.warn(`No projects found for user ID ${userId}`);
          return [];
        }

        logger.info(`Projects found for user ID ${userId}: ${projects.length}`);

        const projectsWithRoles = projects.map((project) => {
          const userRole = userRoles.find(
            (role) => role.project_id === project.project_id
          );

          return {
            ...project,
            role_id: userRole ? userRole.role_id : null,
          };
        })

        return projectsWithRoles;
      } catch(transactionError){
        logger.error(`Transaction failed: ${transactionError.message}`);
        throw transactionError; // triggers rollback
      }
    });


  } catch (error) {
    logger.error(`Error fetching projects for user ID ${userId}: ${error.message}`);
    throw new Error(`Error fetching projects for user: ${error.message}`);
  }
}

export const insertProject = async (data: {
  name: string;
  description: string;
  created_by: string;
  project_key: string;
}) => {
  try {
    const newProject = await prisma.project.create({ data });
    logger.info(`New project created with ID ${newProject.project_id}`);
    return newProject;
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    throw new Error(`Error creating project: ${error.message}`);
  }
};

export const updateProject = async (projectId: number, data: UpdateProjectInput) => {
  try {
    const updateData: Partial<UpdateProjectInput> = data;

    const updatedProject = await prisma.project.update({
      where: { project_id: projectId },
      data: updateData,
    });

    logger.info(`Project with ID ${projectId} updated successfully.`);

    return updatedProject;
  } catch (error) {
    logger.error(`Error updating project with ID ${projectId}: ${error.message}`);
    throw new Error(`Error updating project: ${error.message}`);
  }
};

export const addUserToProjectRepository = async (data, projectId: number) => {
  const { userId } = data;
  const roleId = 3; // Can be dynamic later

  try {
    const roleAlreadyExists = await checkIfUserExistsInProject(userId, projectId);
    if (roleAlreadyExists) {
      return { status: false, reason: "User already assigned role in this project" };
    }

    const userAlreadyExistsInProjectUser = await checkIfUserExistsInProjectUser(projectId, userId);
    if (userAlreadyExistsInProjectUser) {
      return { status: false, reason: "User already added to this project" };
    }

    await prisma.$transaction(async (tx) => {
      await insertUserRole(userId, roleId, projectId, tx);
      await insertProjectUser(projectId, userId, tx);
    });

    return { status: true, reason: "User successfully added to project" };

  } catch (error) {
    logger.error(`Repository error adding user to project: ${error.message}`);
    throw new Error(`Repository error: ${error.message}`);
  }
};

export const addUsersToProjectRepository = async (userIdList: string[], projectId: number) => {
  const roleId = 3; // Can be dynamic later

  try {
    const [existingRoles, existingProjectUsers] = await prisma.$transaction([
      prisma.user_Role.findMany({
        where: {
          user_id: { in: userIdList },
          project_id: projectId,
        },
        select: { user_id: true },
      }),
      prisma.project_User.findMany({
        where: {
          user_id: { in: userIdList },
          project_id: projectId,
        },
        select: { user_id: true },
      }),
    ]);

    const roleUserIds = new Set(existingRoles.map((ur) => ur.user_id));
    const projectUserIds = new Set(existingProjectUsers.map((pu) => pu.user_id));

    const results = [];
    const usersToInsert = [];

    for (const userId of userIdList) {
      if (roleUserIds.has(userId) || projectUserIds.has(userId)) {
        results.push({
          userId,
          status: false,
          reason: 'User already assigned role or added to project',
        });
      } else {
        usersToInsert.push(userId);
      }
    }

    if (usersToInsert.length > 0) {
      const userRolesData = usersToInsert.map((userId) => ({
        user_id: userId,
        role_id: roleId,
        project_id: projectId,
      }));

      const projectUsersData = usersToInsert.map((userId) => ({
        project_id: projectId,
        user_id: userId,
      }));

      await prisma.$transaction([
        prisma.user_Role.createMany({ data: userRolesData }),
        prisma.project_User.createMany({ data: projectUsersData }),
      ]);

      for (const userId of usersToInsert) {
        results.push({
          userId,
          status: true,
          reason: 'User successfully added to project',
        });
      }
    }

    return {
      totalRequested: userIdList.length,
      addedCount: usersToInsert.length,
      skippedCount: results.filter(r => !r.status).length,
      details: results,
    };

  } catch (error) {
    logger.error(`Repository error bulk adding users to project: ${error.message}`);
    throw new Error(`Repository error: ${error.message}`);
  }
};




