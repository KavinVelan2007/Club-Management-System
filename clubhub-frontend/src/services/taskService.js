import { api } from "./apiClient";

export const taskService = {
    getTasks: (params = "") => api.get(`/tasks/${params}`),
    getTask: (taskId) => api.get(`/tasks/${taskId}/`),
    createTask: (payload) => api.post("/tasks/create/", payload),
    updateTask: (taskId, payload) => api.patch(`/tasks/${taskId}/update/`, payload),
    deleteTask: (taskId) => api.del(`/tasks/${taskId}/delete/`),
    updateStatus: (taskId, status) => api.post(`/tasks/${taskId}/status/`, { status }),
    getAssignments: (params = "") => api.get(`/tasks/assignments/${params}`),
    assignTask: (taskId, studentIds) => api.post(`/tasks/${taskId}/assignments/`, { student_ids: studentIds }),
    unassignTask: (taskId, studentId) => api.del(`/tasks/${taskId}/assignments/${studentId}/`),
    getSubmissions: (params = "") => api.get(`/tasks/submissions/${params}`),
};
