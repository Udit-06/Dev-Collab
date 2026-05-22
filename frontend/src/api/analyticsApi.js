import api from "./axios";

export const getDashboardStats = () => api.get("/analytics/dashboard");
export const getNotifications = () => api.get("/notifications");
export const getUnreadNotificationCount = () => api.get("/notifications/unread-count");
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const getCalendarEvents = () => api.get("/calendar/events");