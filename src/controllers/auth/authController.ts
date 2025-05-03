// src/controllers/auth/authController.ts
import { Request, Response } from "express";
import { login, signup, updateUserProfile } from "../../services/auth/authService";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    // Access tokens from the nested auth0Data property
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    const user = await signup(email, password, fullName);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const profileController = (req: Request, res: Response) => {
  res.status(200).json(req.user); // req.user will have user info if authenticated
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const { email, password, fullName, picture } = req.body;

    if (!userId) {
       res.status(400).json({ error: "Missing user ID" });
    }

    const updatedUser = await updateUserProfile(userId, {
      email,
      password,
      fullName,
      picture,
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};