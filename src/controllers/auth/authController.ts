// controllers/authController.ts
import { Request, Response } from 'express';
import { login, signup } from '../../services/auth/authService';


export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await signup(email, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const profileController = (req: Request, res: Response) => {
  res.status(200).json(req.user); // req.user will have user info if authenticated
};
