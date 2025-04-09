import { Request, Response } from 'express';
import { fetchRoles } from '../../services/role/roleService';

export const getRolesController = async (req: Request, res: Response) => {
  try {
    const roles = await fetchRoles();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get roles' });
  }
};
