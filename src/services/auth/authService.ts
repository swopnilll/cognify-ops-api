// src/services/auth/authService.ts
import jwt, { SignOptions } from "jsonwebtoken";
import {
  createUser,
  getUser,
  getUserByEmail,
  normalizeEmail,
  toUserProfile,
  updateUser,
} from "../../repositories/auth/authRepository";
import { getAuthConfig } from "../../config/auth";
import { hashPassword, verifyPassword } from "../../utils/password";
import { HttpError } from "../../utils/httpError";
import logger from "../../utils/logger";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validatePassword = (password: unknown): string => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  return password;
};

const validateEmail = (email: unknown): string => {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new HttpError(400, "A valid email is required");
  }
  return normalizeEmail(email);
};

/**
 * Creates a new user with a hashed password.
 */
export const signup = async (email: string, password: string, fullName: string) => {
  const validEmail = validateEmail(email);
  const validPassword = validatePassword(password);

  if (await getUserByEmail(validEmail)) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await createUser({
    email: validEmail,
    passwordHash: await hashPassword(validPassword),
    fullName: typeof fullName === "string" ? fullName.trim() : "",
  });

  logger.info(`User signed up: ${user.user_id}`);

  return { user: toUserProfile(user) };
};

/**
 * Checks the email and password and returns a signed access token.
 */
export const login = async (email: string, password: string) => {
  const invalid = new HttpError(401, "Wrong email or password");

  if (typeof email !== "string" || typeof password !== "string") throw invalid;

  const user = await getUserByEmail(email);
  if (!user || !user.password_hash) throw invalid;
  if (!(await verifyPassword(password, user.password_hash))) throw invalid;

  await updateUser(user.user_id, { last_login: new Date() });

  const authConfig = getAuthConfig();
  const profile = toUserProfile(user);

  const accessToken = jwt.sign({ email: profile.email }, authConfig.jwtSecret, {
    subject: user.user_id,
    issuer: authConfig.issuer,
    expiresIn: authConfig.jwtExpiresIn as SignOptions["expiresIn"],
    algorithm: "HS256",
  });

  return {
    accessToken,
    user: {
      sub: profile.user_id,
      email: profile.email,
      name: profile.name,
      nickname: profile.nickname,
      picture: profile.picture,
    },
  };
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    email?: string;
    password?: string;
    fullName?: string;
    picture?: string;
  }
) => {
  if (!(await getUser(userId))) {
    throw new HttpError(404, "User not found");
  }

  const data: Parameters<typeof updateUser>[1] = {};

  if (updates.email) {
    const email = validateEmail(updates.email);
    const existing = await getUserByEmail(email);
    if (existing && existing.user_id !== userId) {
      throw new HttpError(409, "An account with this email already exists");
    }
    data.email = email;
  }
  if (updates.password) data.password_hash = await hashPassword(validatePassword(updates.password));
  if (updates.fullName) data.full_name = updates.fullName.trim();
  if (updates.picture) data.picture = updates.picture;

  return toUserProfile(await updateUser(userId, data));
};
