import { api } from "./apiClient";

export const clubService = {
    getClubs: () => api.get("/clubs/"),
    getClub: (clubId) => api.get(`/clubs/${clubId}/`),
    updateClub: (clubId, payload) => api.patch(`/clubs/${clubId}/update/`, payload),
    getMemberships: (params = "") => api.get(`/memberships/memberships/${params}`),
    addMember: (payload) => api.post("/memberships/memberships/", payload),
    updateMember: (clubId, studentId, payload) => api.patch(`/memberships/memberships/${clubId}/${studentId}/`, payload),
    removeMember: (clubId, studentId) => api.del(`/memberships/memberships/${clubId}/${studentId}/`),
    getRoles: () => api.get("/memberships/roles/"),
    getStudents: (search = "") => api.get(`/memberships/students/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    getDepartments: (params = "") => api.get(`/memberships/departments/${params}`),
    getDepartmentMemberships: (params = "") => api.get(`/memberships/department-memberships/${params}`),
};
