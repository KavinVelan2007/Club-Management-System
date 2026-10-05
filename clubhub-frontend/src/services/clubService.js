import { api } from "./apiClient";

export const clubService = {
    getClubs: () => api.get("/clubs/"),
    getClub: (clubId) => api.get(`/clubs/${clubId}/`),
    getMemberships: (params = "") => api.get(`/memberships/memberships/${params}`),
    getDepartments: (params = "") => api.get(`/memberships/departments/${params}`),
    getDepartmentMemberships: (params = "") => api.get(`/memberships/department-memberships/${params}`),
};
