import { api } from "./apiClient";
export const announcementService = { getAnnouncements: (params = "") => api.get(`/announcements/${params}`) };
