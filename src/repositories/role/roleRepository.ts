
import { Role } from '@prisma/client';
import prisma from '../../db/prismaClient';

// Get all roles (e.g., 'admin', 'default')
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        role_id: 'asc'
      }
    });
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Could not fetch roles');
  }
};
