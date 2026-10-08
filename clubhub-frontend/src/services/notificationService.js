import { api } from "./apiClient";

export const notificationService = {
    getNotifications: () => api.get("/notifications/"),
    markRead: (keys) => api.post("/notifications/mark-read/", { keys }),
    markAllRead: () => api.post("/notifications/mark-all-read/"),
};