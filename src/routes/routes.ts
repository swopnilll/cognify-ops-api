import { Router, Request, Response } from 'express';

import authRoutes from './auth/authRoutes';
import passport from 'passport';
import { profileController } from '../controllers/auth/authController';

const router = Router();

//Public Routes

router.use('/auth', authRoutes);

router.get('/protected', passport.authenticate('jwt', { session: false }), profileController);

export default router;