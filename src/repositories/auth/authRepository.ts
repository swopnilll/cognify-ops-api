// src/repositories/auth/authRepository.ts
//
// Users live in the local "User" table. Passwords are stored as scrypt hashes.

import { randomUUID } from "crypto";
import { User } from "@prisma/client";
import prisma from "../../db/prismaClient";

// Shape the rest of the API and the frontend expect for a user's profile.
export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  nickname: string;
  picture: string;
  user_metadata: { fullName: string };
  created_at: Date;
  last_login: Date | null;
}

export const toUserProfile = (user: User): UserProfile => {
  const email = user.email ?? "";
  const fullName = user.full_name ?? "";

  return {
    user_id: user.user_id,
    email,
    name: fullName || email,
    nickname: email.split("@")[0],
    picture: user.picture ?? "",
    user_metadata: { fullName },
    created_at: user.created_at,
    last_login: user.last_login,
  };
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const createUser = async (data: {
  email: string;
  passwordHash: string;
  fullName: string;
}): Promise<User> => {
  return prisma.user.create({
    data: {
      user_id: randomUUID(),
      email: normalizeEmail(data.email),
      password_hash: data.passwordHash,
      full_name: data.fullName,
    },
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { user_id: userId } });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
};

export const updateUser = async (
  userId: string,
  data: Partial<Pick<User, "email" | "password_hash" | "full_name" | "picture" | "last_login">>
): Promise<User> => {
  return prisma.user.update({ where: { user_id: userId }, data });
};

export const deleteUser = async (userId: string): Promise<User> => {
  return prisma.user.delete({ where: { user_id: userId } });
};

export const listUserProfiles = async (): Promise<UserProfile[]> => {
  const users = await prisma.user.findMany({ orderBy: { created_at: "asc" } });
  return users.map(toUserProfile);
};

export const getUserProfilesByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  const users = await prisma.user.findMany({ where: { user_id: { in: userIds } } });
  return users.map(toUserProfile);
};
