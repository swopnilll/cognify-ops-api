import { Router, Request, Response } from 'express';

import authRoutes from './auth/authRoutes';
import passport from 'passport';

import { profileController } from '../controllers/auth/authController';
import { getRolesController } from '../controllers/role/roleController';
import projectRoutes from './projects/projectRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/health', healthRoutes);

// Public Routes
router.use('/auth', authRoutes);

// This one route is also protected individually
router.get('/', passport.authenticate('jwt', { session: false }), profileController);

// 🔐 Protect all routes below this line
router.use(passport.authenticate('jwt', { session: false }));

router.get('/roles', getRolesController);

router.use('/projects', projectRoutes);

export default router;