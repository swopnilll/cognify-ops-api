import { Role } from '@prisma/client';

import { getAllRoles } from '../../repositories/role/roleRepository';

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
