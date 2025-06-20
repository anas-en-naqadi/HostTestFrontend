import axios from "../axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  last_login: string;
};



export interface UpdateProfileData {
  full_name?: string;
  current_password?: string;
  new_password?: string;
  password_confirmation?: string;
}

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: unknown }).response === "object" &&
    (error as { response: unknown }).response !== null
  );
}

/**
 * Update user profile via API
 * @param userId - The ID of the user to update
 * @param data - Profile update data
 * @returns Promise resolving to updated user data
 * @throws Error if the request fails
 */
export const updateUserProfile = async (
  userId: number,
  data: UpdateProfileData
): Promise<ApiResponse<User>> => {
  try {
    // console.log("Making request to:", `/users/profile/update/${userId}`, data);
    const response = await axios.put<ApiResponse<User>>(`/users/profile/update/${userId}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error("API error:", error);
    if (isAxiosError(error)) {
      // console.log("Error response:", error.response?.data, error.response?.status);
      if (error.response?.status === 401) {
        throw new Error("Current password is incorrect");
      }
      throw new Error(error.response?.data?.message || "Failed to update profile");
    }
    throw new Error("Failed to update profile");
  }
};