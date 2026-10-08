import { api } from "./apiClient";

export const announcementService = {
    getAnnouncements: (params = "") => api.get(`/announcements/${params}`),
    createAnnouncement: (payload) => api.post("/announcements/create/", payload),
    updateAnnouncement: (announcementId, payload) => api.patch(`/announcements/${announcementId}/update/`, payload),
    deleteAnnouncement: (announcementId) => api.del(`/announcements/${announcementId}/delete/`),
};
