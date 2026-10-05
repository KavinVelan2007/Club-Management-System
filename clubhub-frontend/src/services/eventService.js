import { api } from "./apiClient";

export const eventService = {
    getEvents: (params = "") => api.get(`/events/${params}`),
    getEvent: (eventId) => api.get(`/events/${eventId}/`),
    getRegistrations: (params = "") => api.get(`/events/registrations/${params}`),
    getAttendance: (params = "") => api.get(`/events/attendance/${params}`),
};
