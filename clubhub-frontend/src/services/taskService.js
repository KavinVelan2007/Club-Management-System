import { api } from "./apiClient";
export const taskService = { getTasks: (params = "") => api.get(`/tasks/${params}`), getAssignments: (params = "") => api.get(`/tasks/assignments/${params}`), getSubmissions: (params = "") => api.get(`/tasks/submissions/${params}`) };
