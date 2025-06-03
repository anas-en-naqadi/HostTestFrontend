import axiosClient from "@/lib/axios";

export interface RefreshTokenResponse {
  token: string; // This matches the backend controller response
  user: object;
}

/**
 * Refresh the access token using the refresh token stored in HTTP-only cookie
 * This function should be called when the access token expires
 * 
 * @returns New access token and user data
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    // Using axiosRefresh to avoid interceptors that might cause infinite loops
    const response = await axiosClient.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
