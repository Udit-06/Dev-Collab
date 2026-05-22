import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    const cleanToken = token.startsWith("Bearer ")
      ? token.substring(7)
      : token;

    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - token missing, invalid, or expired");
    }
    if (error.response?.status === 403) {
      console.log("Forbidden - user authenticated but not allowed");
    }
    return Promise.reject(error);
  }
);

export default api;