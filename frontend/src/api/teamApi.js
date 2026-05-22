import api from "./axios";

export const createTeam = (data) => api.post("/teams", data);

export const getTeams = () => api.get("/teams");

export const addMember = (teamId, userId) =>
  api.put(`/teams/${teamId}/add-member/${userId}`);

export const inviteToTeam = (teamId, email) =>
  api.post(`/teams/${teamId}/invite`, { email });

export const deleteTeam = (id) => api.delete(`/teams/${id}`);
