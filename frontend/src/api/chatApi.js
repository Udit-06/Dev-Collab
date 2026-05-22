import axios from "axios";

const API = "http://localhost:8080";

const authHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
};

export const getChatUsers = () =>
  axios.get(`${API}/chat/users`, {
    headers: authHeader(),
  });

export const getConversation = (otherUserId) =>
  axios.get(`${API}/chat/conversation/${otherUserId}`, {
    headers: authHeader(),
  });