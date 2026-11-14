// config/auth.ts
require('dotenv').config();

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  issuer: string;
}

export const getAuthConfig = (): AuthConfig => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }

  return {
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "cognify-ops-api",
  };
};
