import { useState } from "react";
import { updateUserProfile } from "../api/profile";

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

interface UpdateProfileData {
  full_name?: string;
  current_password?: string;
  new_password?: string;
  password_confirmation?: string;
}

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (userId: number, data: UpdateProfileData): Promise<ApiResponse<User>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await updateUserProfile(userId, data);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading, error };
};