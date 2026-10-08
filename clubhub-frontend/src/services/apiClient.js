const API_URL = "http://127.0.0.1:8000/api";

const storageKeys = {
    access: "accessToken",
    refresh: "refreshToken",
};

const sessionStores = [localStorage, sessionStorage];

function getSessionValue(key) {
    return sessionStores.map((store) => store.getItem(key)).find(Boolean) || null;
}

function clearSession() {
    [...Object.values(storageKeys), "role", "userId", "userName", "userEmail"].forEach((key) => sessionStores.forEach((store) => store.removeItem(key)));
}

async function refreshAccessToken() {
    const refresh = getSessionValue(storageKeys.refresh);

    if (!refresh) return null;

    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const store = sessionStores.find((candidate) => candidate.getItem(storageKeys.refresh)) || localStorage;
    store.setItem(storageKeys.access, data.access);
    return data.access;
}

async function request(path, options = {}, retryOnUnauthorized = true) {
    const token = getSessionValue(storageKeys.access);
    const headers = new Headers(options.headers);

    if (token) headers.set("Authorization", `Bearer ${token}`);

    let body = options.body;
    if (body && typeof body !== "string") {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, { ...options, body, headers });

    if (response.status === 401 && retryOnUnauthorized) {
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken) {
            return request(path, { ...options, body }, false);
        }

        clearSession();
        window.dispatchEvent(new Event("clubhub:session-expired"));
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.detail || data?.error || "Unable to load data. Please try again.");
    }

    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path, body) => request(path, { method: "DELETE", body }),
};

export { API_URL, clearSession };
