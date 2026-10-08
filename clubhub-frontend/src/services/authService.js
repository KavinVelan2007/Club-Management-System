import { api } from "./apiClient";

const API_URL = "http://127.0.0.1:8000/api";

export async function login(identifier, password, role) {
    const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier,
            password,
            role,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }

    return data;
}

export const authService = {
    login,
    getMe: () => api.get("/auth/me/"),
    getDashboard: () => api.get("/auth/dashboard/"),
    updateProfile: (payload) => api.patch("/auth/profile/", payload),
    changePassword: (payload) => api.post("/auth/change-password/", payload),
};
