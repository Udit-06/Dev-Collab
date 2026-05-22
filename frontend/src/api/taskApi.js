import api from "./axios";

export const getTasks = () => api.get("/tasks");
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);
export const createTask = (projectId, data) => api.post(`/tasks/project/${projectId}`, data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);