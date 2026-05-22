import api from "./axios";

export const loginUser = (data) => api.post("/users/login", data);

export const registerUser = (data) => api.post("/users/register", data);

export const getProfile = () => api.get("/users/profile");

export const updateProfile = (data) => api.put("/users/profile", data);

export const changePassword = (data) =>
  api.post("/users/change-password", data);

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/users/profile/upload", formData);
};

export const forgotPassword = (email) =>
  api.post("/users/forgot-password", { email });

export const resetPassword = (data) =>
  api.post("/users/reset-password", data);

export const deleteAccount = () =>
  api.delete("/users/delete-account");