import api from "./axios";

export const createProject = (data) => api.post("/projects", data);
export const getProjects = () => api.get("/projects");
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const getProjectMembers = (id) => api.get(`/projects/${id}/members`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const getProjectTasks = (projectId) => api.get(`/tasks/project/${projectId}`);
export const getProjectFiles = (projectId) => api.get(`/files/project/${projectId}`);

export const uploadProjectFile = (projectId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/files/upload/${projectId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};