import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession } from "../services/apiClient";

const AuthContext = createContext(null);

function readUser() {
    const stores = [localStorage, sessionStorage];
    const get = (key) => stores.map((store) => store.getItem(key)).find(Boolean) || null;
    const accessToken = get("accessToken");
    if (!accessToken) return null;

    return {
        accessToken,
        role: get("role"),
        userId: get("userId"),
        name: get("userName"),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser);

    useEffect(() => {
        const expireSession = () => setUser(null);
        window.addEventListener("clubhub:session-expired", expireSession);
        return () => window.removeEventListener("clubhub:session-expired", expireSession);
    }, []);

    const value = useMemo(() => ({
        user,
        signIn: (data, keepSignedIn = false) => {
            clearSession();
            const store = keepSignedIn ? localStorage : sessionStorage;
            store.setItem("accessToken", data.access);
            store.setItem("refreshToken", data.refresh);
            store.setItem("role", data.role);
            store.setItem("userId", data.user_id);
            store.setItem("userName", data.name || "ClubHub user");
            setUser(readUser());
        },
        signOut: () => {
            clearSession();
            setUser(null);
        },
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
