
import { Role } from '@prisma/client';
import prisma from '../../db/prismaClient';
import logger from '../../utils/logger';

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

export const getRoleId = async (roleName: string): Promise<number> => {
  try {    
    const adminRole = await prisma.role.findFirst({
      where: {
        role_name: roleName,
      }
    })

    return adminRole.role_id;
  } catch (error) {
    console.error('Error fetching role id:', error);
    throw new Error('Could not fetch role id');
  }
};