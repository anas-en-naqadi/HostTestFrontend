import { useState } from "react";
import { updateUserProfile, UserResponse } from "../api/profile";

interface UpdateProfileData {
  full_name?: string;
  current_password?: string;
  new_password?: string;
  password_confirmation?: string;
}

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (userId: number, data: UpdateProfileData): Promise<UserResponse> => {
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