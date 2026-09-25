import axios from "axios";

// Uvicorn serves the FastAPI application on port 8000 by default.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const AUTH_UNAUTHORIZED_EVENT = "ceylontour:unauthorized";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const hadAccessToken = Boolean(localStorage.getItem("token"));
        localStorage.removeItem("token");
        localStorage.removeItem("ceylontour_user");
        if (hadAccessToken) {
          sessionStorage.setItem(
            "ceylontour_auth_message",
            "Your session has expired. Please sign in again.",
          );
        }
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
