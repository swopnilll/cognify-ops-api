// config/auth0.ts
require('dotenv').config();

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  apiIdentifier: string;
  managementAudience: string;
}

export const getAuth0Config = (): Auth0Config => ({
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  apiIdentifier: process.env.AUTH0_API_IDENTIFIER || '',
  managementAudience: process.env.AUTH0_MANAGEMENT_AUDIENCE || ''
});