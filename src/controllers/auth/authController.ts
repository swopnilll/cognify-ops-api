// src/controllers/auth/authController.ts
import { Request, Response } from "express";
import { login, signup, updateUserProfile } from "../../services/auth/authService";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    const user = await signup(email, password, fullName);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const profileController = (req: Request, res: Response) => {
  res.status(200).json(req.user); // req.user will have user info if authenticated
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    // Users may only update their own profile: the ID comes from the verified JWT.
    const userId = (req.user as any)?.sub;
    const { email, password, fullName, picture } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const updatedUser = await updateUserProfile(userId, {
      email,
      password,
      fullName,
      picture,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};