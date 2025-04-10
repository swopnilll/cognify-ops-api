import { Role } from '@prisma/client';

import { getAllRoles, getRoleId } from '../../repositories/role/roleRepository';
import logger from '../../utils/logger';

/**
 * Service function to retrieve all roles.
 *
 * @returns A list of roles from the database.
 */
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const roles = await getAllRoles();
    return roles;
  } catch (error) {
    console.error('Role Service Error:', error);
    throw error;
  }
};

export const fetchRoleIdByRoleName = async (roleName): Promise<number> => {
  try {
    const roles = await getRoleId(roleName);
    return roles;
  } catch (error) {
    logger.error('Role Service Error:', error);
    throw error;
  }
};

