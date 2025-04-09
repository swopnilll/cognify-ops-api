// src/services/authService.ts
import { AxiosError } from "axios";
import {
  auth0Signup,
  auth0Login,
  createUser,
  getUser,
} from "../../repositories/auth/authRepository";

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
    // Create user in Auth0.
    const auth0User = await auth0Signup(email, password);

    // Check for a valid user_id in the Auth0 response.
    if (!auth0User.user_id) {
      throw new Error("Auth0 did not return a valid user_id");
    }

    // Create a corresponding record in the local database.
    const localUser = await createUser(auth0User.user_id);

    // Return both Auth0 and local user details.
    return { auth0User, localUser };
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
    if (!auth0Data.user_id) {
      throw new Error("Auth0 did not return a valid user_id");
    }

    // Optionally, ensure a corresponding local record exists.
    // Depending on your application logic, you might want to create a local user if one does not exist.
    let localUser = await getUser(auth0Data.user_id);
    if (!localUser) {
      // In case the user record is missing, you might choose to create it.
      localUser = await createUser(auth0Data.user_id);
    }

    return {
      accessToken: auth0Data.accessToken
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
