// src/api/axios.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// To track if we are currently refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Request Interceptor ---
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor ---
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 403 (Forbidden)
    if (error.response?.status === 403) {
      // User is authenticated but doesn't have the right role
      window.location.href = "/unauthorized";
      return Promise.reject(error);
    }

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hit refresh endpoint
        const response = await axios.post(
          `${BASE_URL}/user/refresh`,
          {refreshToken: localStorage.getItem("refreshToken")},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);

        // Update headers for the current instance and process the queue
        API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        
        // Only redirect to login if the refresh attempt itself fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);