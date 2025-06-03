// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Security utility functions
const ENCRYPTION_KEY = 'Forge-Platform-Secret-Key'; // A simple key for token encryption

// Function to encrypt the token before storage
const encryptToken = (token: string): string => {
  if (!token) return '';
  try {
    // Simple XOR encryption with the key
    return Array.from(token)
      .map((char, index) => {
        const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length];
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
      })
      .join('')
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Token encryption failed:', error);
    return '';
  }
};

// Function to decrypt the token when needed
const decryptToken = (encryptedToken: string): string | null => {
  if (!encryptedToken) return null;
  try {
    // Convert hex back to characters
    const hexPairs = encryptedToken.match(/.{1,2}/g) || [];
    const encryptedChars = hexPairs.map(hex => String.fromCharCode(parseInt(hex, 16)));
    
    // XOR decrypt with the same key
    return encryptedChars
      .map((char, index) => {
        const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length];
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
      })
      .join('');
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
};

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

type AuthState = {
  session_id: string | null;
  user: User | null;
  // The actual functions users will interact with
  setAuth: (session_id: string, user: User) => void;
  clearAuth: () => void;
  // Getter function to retrieve decrypted token when needed
  getToken: () => string | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session_id: null,
      user: null,
      setAuth: (accessToken, user) => {
        const session_id = encryptToken(accessToken);
        set({ session_id, user });
      },
      clearAuth: () => set({ session_id: null, user: null }),
      getToken: () => {
        const { session_id } = get();
        return session_id ? decryptToken(session_id) : null;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ session_id: state.session_id, user: state.user }),
    }
  )
);

