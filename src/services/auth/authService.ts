// src/services/authService.ts
import { AxiosError } from "axios";
import {
  auth0Signup,
  auth0Login,
  createUser,
  getUser,
} from "../../repositories/auth/authRepository";
import logger from "../../utils/logger";

/**
 * Signs up a new user by first creating the user in Auth0,
 * then creating a corresponding record in the local database.
 *
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns An object containing the Auth0 response and local user record.
 */
export const signup = async (email: string, password: string) => {
  try {

    logger.info("Sign up service called");


    // Create user in Auth0.
    const auth0Result = await auth0Signup(email, password);

    if (auth0Result.ok) {
      const auth0User = auth0Result.value;
      logger.info("Auth0 user created:", auth0User);

      // Create a corresponding record in the local database.
      const localUser = await createUser(auth0User.user_id);

      // Return both Auth0 and local user details.
      return { auth0User, localUser };
    }

    // Handle the case where Auth0 signup fails.
    const errorMessage = !auth0Result.ok && 'error' in auth0Result ? auth0Result.error : "Unknown error during signup";
    logger.error("Auth0 signup failed:", errorMessage);
    throw new Error(typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage));  
  } catch (error: any) {
    // Optionally, you can add more detailed error handling here.
    if (error instanceof AxiosError) {
      console.error("Signup error:", error.response?.data || error.message);
    } else {
      console.error("Signup error:", error);
    }
    throw error;
  }
};

/**
 * Logs in a user using Auth0, then retrieves the corresponding local user record.
 *
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns An object containing the Auth0 login data and local user record.
 */
export const login = async (email: string, password: string) => {
  try {
    // Perform Auth0 login.
    const auth0Data = await auth0Login(email, password);

    // Ensure that we received a valid user id from Auth0.
    if (!auth0Data.userProfile) {
      throw new Error("Auth0 did not return a valid user_id");
    }

    // Optionally, ensure a corresponding local record exists.
    // Depending on your application logic, you might want to create a local user if one does not exist.
    let localUser = await getUser(auth0Data.userProfile.sub);
    if (!localUser) {
      // In case the user record is missing, you might choose to create it.
      localUser = await createUser(auth0Data.userProfile.sub);
    }

    return {
      accessToken: auth0Data.accessToken,
      user: auth0Data.userProfile
    };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error("Login error:", error.response?.data || error.message);
    } else {
      console.error("Login error:", error);
    }
    throw error;
  }
};
