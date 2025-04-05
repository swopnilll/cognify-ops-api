import axios, { AxiosError } from 'axios';
import { getAuth0Config } from '../../config/auth0';

const auth0Config = getAuth0Config();

const getManagementToken = async (): Promise<string> => {
  const { data } = await axios.post(
    `https://${auth0Config.domain}/oauth/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: auth0Config.clientId,
      client_secret: auth0Config.clientSecret,
      audience: auth0Config.managementAudience
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data.access_token;
};

export const login = async (email: string, password: string) => {
  try {
    const params = new URLSearchParams();

    params.append('grant_type', 'password');
    params.append('username', email);
    params.append('password', password);
    params.append('audience', auth0Config.apiIdentifier);
    params.append('client_id', auth0Config.clientId);
    params.append('client_secret', auth0Config.clientSecret);
    params.append('scope', 'openid profile email');
    params.append('connection', 'Username-Password-Authentication');

    const response = await axios.post(
      `https://${auth0Config.domain}/oauth/token`,
      params,
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'gzip,deflate,compress' 
        }
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data || {} as any;
    console.error('Auth0 Error:', {
      status: axiosError.response?.status,
      error: errorData?.error,
      description: errorData?.error_description,
      body: errorData
    });
    throw new Error(errorData?.error_description || 'Login failed');
  }
};

export const signup = async (email: string, password: string) => {
  try {
    const mgmtToken = await getManagementToken();
    
    const response = await axios.post(
      `https://${auth0Config.domain}/api/v2/users`,
      {
        email,
        password,
        connection: 'Username-Password-Authentication',
        verify_email: false, // Set based on your requirements
        email_verified: true // Set based on your requirements
      },
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const errorDescription = axiosError.message;
    throw new Error(
      errorDescription || 
      'User registration failed. Please try again.'
    );
  }
};