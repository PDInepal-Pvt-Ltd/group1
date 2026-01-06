// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "/",  // Uses Vite proxy → correct
  // Remove withCredentials since you're not using cookies
  // withCredentials: true  ← DELETE or comment out
});

// Add the Authorization header automatically if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Handle 401 (token expired/invalid)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token invalid or expired - clearing and redirecting to login");
      localStorage.removeItem("accessToken");
      // Optional: redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;