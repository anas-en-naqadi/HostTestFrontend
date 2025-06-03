import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { navigate } from "./utils/navigator";
import { useAuthStore } from "@/store/authStore";
import { refreshToken } from "./api";
import { logout } from "./api";

// Create an instance of Axios
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.trim(), // Base URL for the API, set in .env file, trim any spaces
  withCredentials: true, // Important for refresh token flow with HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track if a token refresh is in progress to prevent multiple refresh attempts
let isRefreshing = false;
// Store for queued requests that failed due to token expiration
let failedQueue: { resolve: Function; reject: Function; config: AxiosRequestConfig }[] = [];

// Process failed queue (either retry all with new token or reject all)
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      if (token && promise.config.headers) {
        promise.config.headers.Authorization = `Bearer ${token}`;
      }
      promise.resolve(axiosClient(promise.config));
    }
  });
  
  // Reset the queue
  failedQueue = [];
};

// Add token to outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
type ErrorRoutes = {
  [key: number]: string;
};

// Set up response interceptors for error handling and token refresh
let isLoggingOut = false;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    
    // Check if the request should be retried after token refresh
    const shouldRefreshToken = status === 401 && 
      originalRequest && 
      !originalRequest._retry && 
      !isLoggingOut &&
      !originalRequest.url?.includes('auth/refresh-token') &&
      !originalRequest.url?.includes('auth/login') &&
      !originalRequest.url?.includes('auth/logout') &&
      useAuthStore.getState().getToken() !== null; // Only try to refresh if we had a token
      
    // Handle token expiration (401 Unauthorized)
    if (shouldRefreshToken) {
      originalRequest._retry = true;
      
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const { token, user } = await refreshToken();
        
        // Update token in auth store
        useAuthStore.getState().setAuth(token, user);
        
        // Ensure headers object exists in original request
        originalRequest.headers = originalRequest.headers || {};
        
        // Update headers for the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Process any queued requests with the new token
        processQueue(null, token);
        
        // Retry the original request that failed
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed - need to logout
        processQueue(new Error('Refresh token failed'));
        
        // Only perform logout once if refresh token fails
        if (!isLoggingOut) {
          isLoggingOut = true;
          
          // Clear auth store first to prevent further requests with invalid token
          useAuthStore.getState().clearAuth();
          
          try {
            // Use a simple fetch to avoid axios interceptors for logout
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
            });
          } catch (logoutError) {
            console.error('Error during logout after token refresh failure:', logoutError);
            // Continue with redirect even if logout API call fails
          } finally {
            // Delay navigation slightly to allow state updates to complete
            setTimeout(() => {
              navigate('/login');
              // Reset flags after navigation
              isLoggingOut = false;
            }, 100);
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle permanent 401 (when refresh fails or for other auth issues)
    if (status === 401 && 
        !isRefreshing &&
        !isLoggingOut && 
        !(originalRequest?.url?.includes('auth/logout')) &&
        !(originalRequest?.url?.includes('auth/refresh-token')) &&
        !(originalRequest?.url?.includes('auth/login'))) {
      isLoggingOut = true;
      useAuthStore.getState().clearAuth();
      try {
        await logout();
      } catch {}
      setTimeout(() => {
        navigate('/login');
        isLoggingOut = false;
      }, 100);
    }
    
    const errorRoutes: ErrorRoutes = {
      429: "/too-many-request",
      403: "/forbidden",
      404: "/not-found", 
      500: "/server-error",
    };
    if (status && errorRoutes[status]) {
      navigate(errorRoutes[status]);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
