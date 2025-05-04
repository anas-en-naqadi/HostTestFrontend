// store/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// type User = {
//   id: number;
//   full_name: string;
//   username: string;
//   email: string;
//   role: string;
//   status: string;
//   email_verified: boolean;
//   last_login: string;
// };

type AuthState = {
  accessToken: string | null;
  user: object | null;
  setAuth: (accessToken: string, user: object) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);

