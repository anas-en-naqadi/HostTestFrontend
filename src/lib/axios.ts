import axios from "axios";
import { navigate } from "./utils/navigator";
import { useAuthStore } from "@/store/authStore";
// Create an instance of Axios
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Base URL for the API, set in .env file
  withCredentials:true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Set up response interceptors if needed (e.g., for error handling)
axiosClient.interceptors.response.use(
  (response) => response,
 async (error) => {
  const status = error.response?.status;

  // Handle specific error codes
  if (status === 429) {
    navigate("/429");
  } else if (status === 404) {
    navigate("/404");
  } else if (status === 500) {
    navigate("/500");
  }
  if (status === 401) {
    localStorage.clear(); // clear all localStorage (or just specific keys if you prefer)
    navigate("/login");
  }
    return Promise.reject(error);
  }
);

export default axiosClient;
