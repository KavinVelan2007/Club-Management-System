import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession } from "../services/apiClient";
import { authService } from "../services/authService";

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
        email: get("userEmail"),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const expireSession = () => {
            setUser(null);
            setProfile(null);
        };
        window.addEventListener("clubhub:session-expired", expireSession);
        return () => window.removeEventListener("clubhub:session-expired", expireSession);
    }, []);

    // Load the role/permission snapshot from the backend for the signed-in user.
    useEffect(() => {
        let cancelled = false;
        if (!user) {
            setProfile(null);
            return undefined;
        }
        authService.getMe()
            .then((data) => { if (!cancelled) setProfile(data); })
            .catch(() => { if (!cancelled) setProfile(null); });
        return () => { cancelled = true; };
    }, [user?.accessToken, user?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const reloadProfile = useCallback(async () => {
        try {
            const data = await authService.getMe();
            setProfile(data);
            return data;
        } catch {
            return null;
        }
    }, []);

    const value = useMemo(() => ({
        user,
        profile,
        reloadProfile,
        isManagerOf: (clubId) => Boolean(profile?.managed_club_ids?.includes(clubId)),
        signIn: (data, keepSignedIn = false) => {
            clearSession();
            const store = keepSignedIn ? localStorage : sessionStorage;
            store.setItem("accessToken", data.access);
            store.setItem("refreshToken", data.refresh);
            store.setItem("role", data.role);
            store.setItem("userId", data.user_id);
            store.setItem("userName", data.name || "ClubHub user");
            store.setItem("userEmail", data.email || "");
            setProfile(null);
            setUser(readUser());
        },
        signOut: () => {
            clearSession();
            setProfile(null);
            setUser(null);
        },
    }), [user, profile, reloadProfile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
