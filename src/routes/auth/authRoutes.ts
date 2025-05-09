// routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';

import { loginController, profileController, signupController, updateProfileController } from '../../controllers/auth/authController';


const authRoutes = Router();

// Login Route
authRoutes.post('/login', loginController);

// Signup Route
authRoutes.post('/signup', signupController);

authRoutes.patch('/update-profile', updateProfileController);


export default authRoutes;
