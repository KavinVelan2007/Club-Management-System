import { api } from "./apiClient";

export const eventService = {
    getEvents: (params = "") => api.get(`/events/${params}`),
    getEvent: (eventId) => api.get(`/events/${eventId}/`),
    createEvent: (payload) => api.post("/events/create/", payload),
    updateEvent: (eventId, payload) => api.patch(`/events/${eventId}/`, payload),
    deleteEvent: (eventId) => api.del(`/events/${eventId}/`),
    register: (eventId) => api.post(`/events/${eventId}/register/`),
    unregister: (eventId) => api.del(`/events/${eventId}/register/`),
    getRegistrations: (params = "") => api.get(`/events/registrations/${params}`),
    getAttendance: (params = "") => api.get(`/events/attendance/${params}`),
};
