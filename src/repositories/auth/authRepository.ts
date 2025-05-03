// src/repositories/auth/authRepository.ts

import axios, { AxiosError } from "axios";
import { User } from "@prisma/client";
import prisma from "../../db/prismaClient";
import { getAuth0Config } from "../../config/auth0";
import logger from "../../utils/logger";

// --- Result Type ---
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

// Helper functions for creating Result objects
const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
const err = <E>(error: E): Err<E> => ({ ok: false, error });

// --- Specific Error Types ---
type Auth0SignupError =
  | { type: "TokenRetrievalFailed"; cause: unknown }
  | { type: "UserAlreadyExists"; email: string; message: string }
  | { type: "Auth0ApiError"; status?: number; data?: any; message: string }
  | { type: "NetworkError"; message: string }
  | { type: "UnknownError"; cause: unknown };

// --- Auth0 User Data Type
interface Auth0User {
  user_metadata: any;
  created_at: any;
  last_login: any;
  nickname: any;
  name: any;
  email_verified: any;
  picture: any;
  user_id: string;
  email: string;
}

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

const tryGetManagementToken = async (): Promise<
  Result<string, Auth0SignupError>
> => {
  try {
    const token = await getManagementToken();
    return ok(token);
  } catch (error) {
    logger.error("Failed to retrieve Auth0 Management Token:", error);
    return err({ type: "TokenRetrievalFailed", cause: error });
  }
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
      userProfile,
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
export const auth0Signup = async (
  email: string,
  password: string,
  fullName: string,
): Promise<Result<Auth0User, Auth0SignupError>> => {
  const tokenResult = await tryGetManagementToken();

  if (!tokenResult.ok) {
    return err({
      type: "TokenRetrievalFailed",
      cause: (tokenResult as Err<Auth0SignupError>).error,
    });
  }

  const mgmtToken = tokenResult.value;
  logger.info("Management Token Retrieved:", mgmtToken);

  // Prepare request data (pure transformation)
  const url = `https://${auth0Config.domain}/api/v2/users`;

  const data = {
    email,
    password,
    connection: "Username-Password-Authentication",
    user_metadata: {
      fullName: fullName
    },
    verify_email: false, // Change as needed
    email_verified: true, // Change as needed - consider security implications
  };

  const config = {
    headers: {
      Authorization: `Bearer ${mgmtToken}`,
      "Content-Type": "application/json",
    },
  };

  //  Execute the side effect (API call) and map result/error
  try {
    logger.info(`Attempting Auth0 user creation for: ${email}`); // Side effect: Logging
    const response = await axios.post<Auth0User>(url, data, config); // Side effect: API Call
    logger.info("Auth0 Signup Successful:", response.data); // Side effect: Logging

    return ok(response.data);
  } catch (error: any) {
    logger.error("Auth0 Signup Error occurred"); // Side effect: Logging

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>; // Use any for generic Auth0 error data
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;
      const errorMessage = axiosError.message;

      logger.error(
        `Auth0 Axios Error: Status=${status}, Message=${errorMessage}`,
        responseData
      ); // Side effect: Logging

      if (status === 409) {
        // Specific, known error -> map to specific Err type

        return err({
          type: "UserAlreadyExists",
          email: email,
          message:
            responseData?.message || `User with email ${email} already exists.`,
        });
      } else if (status) {
        // Other API error with a status code

        return err({
          type: "Auth0ApiError",
          status: status,
          data: responseData,
          message:
            responseData?.message ||
            errorMessage ||
            `Auth0 API request failed with status ${status}.`,
        });
      } else {
        // Network error or request setup error
        return err({
          type: "NetworkError",
          message: errorMessage || "Network error during Auth0 signup request.",
        });
      }
    } else {
      // Non-Axios error

      logger.error("Non-Axios Error during Auth0 Signup:", error); // Side effect: Logging
      return err({ type: "UnknownError", cause: error });
    }
  }
};

export const updateAuth0User = async (
  userId: string,
  updates: {
    email?: string;
    password?: string;
    user_metadata?: { fullName?: string };
    picture?: string;
  }
): Promise<Result<Auth0User, Auth0SignupError>> => {
  const tokenResult = await tryGetManagementToken();

  if (!tokenResult.ok) {
    return err({
      type: "TokenRetrievalFailed",
      cause: (tokenResult as Err<Auth0SignupError>).error,
    });
  }

  const mgmtToken = tokenResult.value;
  const url = `https://${auth0Config.domain}/api/v2/users/${encodeURIComponent(userId)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${mgmtToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.patch<Auth0User>(url, updates, config);
    return ok(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return err({
        type: "Auth0ApiError",
        status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return err({ type: "UnknownError", cause: error });
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

export const getAllAuth0Users = async (): Promise<Auth0User[]> => {
  const tokenResult = await tryGetManagementToken();

  if (!tokenResult.ok) {
    throw new Error("Failed to retrieve Auth0 token");
  }

  const mgmtToken = tokenResult.value;

  const url = `https://${auth0Config.domain}/api/v2/users`;

  try {
    const response = await axios.get<Auth0User[]>(url, {
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
      },
    });

    return response.data;
  } catch (error) {
    logger.error("Error fetching users from Auth0", error);
    throw new Error("Failed to fetch users from Auth0");
  }
};

export const getAuth0UsersByIds = async (userIds: string[]): Promise<Auth0User[]> => {
  const tokenResult = await tryGetManagementToken();

  if (!tokenResult.ok) {
    throw new Error("Failed to retrieve Auth0 token");
  }

  const mgmtToken = tokenResult.value;

  const baseUrl = `https://${auth0Config.domain}/api/v2/users`;

  try {
    const userRequests = userIds.map((userId) =>
      axios.get<Auth0User>(`${baseUrl}/${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      })
    );

    const responses = await Promise.allSettled(userRequests);

    const users: Auth0User[] = [];
    const failedIds: string[] = [];

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        users.push(result.value.data);
      } else {
        logger.warn(`Failed to fetch user ${userIds[index]}: ${result.reason}`);
        failedIds.push(userIds[index]);
      }
    });

    if (failedIds.length > 0) {
      logger.warn(`Some users could not be fetched: ${failedIds.join(', ')}`);
    }

    return users;
  } catch (error) {
    logger.error("Error fetching users from Auth0", error);
    throw new Error("Failed to fetch users from Auth0");
  }
};
