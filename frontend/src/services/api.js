// src/services/api.js
import axios from "axios";

// Base instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // prevents hanging requests
});

// --- Automatically attach token if saved ---
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// --- Optional: Auto logout on invalid/expired token ---
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired → remove + redirect
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // You CANNOT call navigate here; but you can reload:
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Manual token setter (still available)
export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;
