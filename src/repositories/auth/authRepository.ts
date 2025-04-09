// src/repositories/auth/authRepository.ts

import axios, { AxiosError } from "axios";
import { User } from "@prisma/client";
import prisma from "../../db/prismaClient";
import { getAuth0Config } from "../../config/auth0";

const auth0Config = getAuth0Config();

const getManagementToken = async (): Promise<string> => {
  const { data } = await axios.post(
    `https://${auth0Config.domain}/oauth/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: auth0Config.clientId,
      client_secret: auth0Config.clientSecret,
      audience: auth0Config.managementAudience,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data.access_token;
};

/*========================================
=            Auth0 Operations            =
========================================*/

/**
 * Authenticates a user by calling Auth0's token endpoint.
 *
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The Auth0 login response data.
 */
export const auth0Login = async (email: string, password: string) => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", email);
    params.append("password", password);
    params.append("audience", auth0Config.apiIdentifier);
    params.append("client_id", auth0Config.clientId);
    params.append("client_secret", auth0Config.clientSecret);
    params.append("scope", "openid profile email");
    params.append("connection", "Username-Password-Authentication");

    const response = await axios.post(
      `https://${auth0Config.domain}/oauth/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    );

    const accessToken = response.data.access_token;

    const userInfoResponse = await axios.get(
      `https://${auth0Config.domain}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userProfile = userInfoResponse.data;

    return {
      accessToken,
      user_id: userProfile.sub,
      email: userProfile.email,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data || ({} as any);
    console.error("Auth0 Login Error:", {
      status: axiosError.response?.status,
      error: errorData?.error,
      description: errorData?.error_description,
      body: errorData,
    });
    throw new Error(errorData?.error_description || "Login failed");
  }
};

/**
 * Registers a new user in Auth0 by calling the management API.
 *
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The Auth0 signup response data.
 */
export const auth0Signup = async (email: string, password: string) => {
  try {
    const mgmtToken = await getManagementToken();
    const response = await axios.post(
      `https://${auth0Config.domain}/api/v2/users`,
      {
        email,
        password,
        connection: "Username-Password-Authentication",
        verify_email: false, // Change as needed
        email_verified: true, // Change as needed
      },
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const errorDescription = axiosError.message;
    throw new Error(
      errorDescription || "User registration failed. Please try again."
    );
  }
};

/*=====  End of Auth0 Operations  ======*/

/*========================================
=            Local DB Operations         =
========================================*/

/**
 * Creates a new user record in the local database.
 *
 * @param userId - The unique user identifier (e.g., from Auth0).
 * @returns The created User record.
 */
export const createUser = async (userId: string): Promise<User> => {
  try {
    const newUser = await prisma.user.create({
      data: { user_id: userId },
    });
    return newUser;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

/**
 * Retrieves a user record by its unique identifier.
 *
 * @param userId - The unique user identifier.
 * @returns The User record or null if not found.
 */
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });
    return user;
  } catch (error: any) {
    console.error(`Error retrieving user with id ${userId}:`, error);
    throw new Error("Failed to retrieve user");
  }
};

/**
 * Updates a user record.
 *
 * @param userId - The unique user identifier.
 * @param data - An object containing fields to update.
 * @returns The updated User record.
 */
export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, "user_id">>
): Promise<User> => {
  try {
    // The model currently has only user_id; extend this function when more fields are added.
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data,
    });
    return updatedUser;
  } catch (error: any) {
    console.error(`Error updating user with id ${userId}:`, error);
    throw new Error("Failed to update user");
  }
};

/**
 * Deletes a user record from the local database.
 *
 * @param userId - The unique user identifier.
 * @returns The deleted User record.
 */
export const deleteUser = async (userId: string): Promise<User> => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { user_id: userId },
    });
    return deletedUser;
  } catch (error: any) {
    console.error(`Error deleting user with id ${userId}:`, error);
    throw new Error("Failed to delete user");
  }
};

/**
 * Lists all users from the local database.
 *
 * @returns An array of User records.
 */
export const listUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error: any) {
    console.error("Error listing users:", error);
    throw new Error("Failed to list users");
  }
};
