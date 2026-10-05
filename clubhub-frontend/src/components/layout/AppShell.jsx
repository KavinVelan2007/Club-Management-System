import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarDays, CheckSquare, LayoutDashboard, LogOut, Megaphone, Settings, Users } from "lucide-react";
import GlassSurface from "../GlassSurface/GlassSurface";
import { useAuth } from "../../context/AuthContext";
import "./AppShell.css";

const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clubs", label: "My Clubs", icon: Users },
    { to: "/members", label: "Members", icon: Users },
    { to: "/events", label: "Events", icon: CalendarDays },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/announcements", label: "Announcements", icon: Megaphone },
    { to: "/settings", label: "Settings", icon: Settings },
];

function AppShell() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "C";

    function logout() {
        signOut();
        navigate("/", { replace: true });
    }

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <GlassSurface width="100%" height="100%" borderRadius={22} backgroundOpacity={0.1} brightness={16} blur={14} className="app-sidebar-glass">
                    <div className="app-sidebar-content">
                        <NavLink className="app-brand" to="/dashboard">
                            <span className="app-brand-mark">C</span>
                            <span>Club<span>Hub</span></span>
                        </NavLink>
                        <nav className="app-nav" aria-label="Main navigation">
                            <span className="app-nav-label">Workspace</span>
                            {navigation.slice(0, 6).map(({ to, label, icon: Icon }) => (
                                <NavLink key={to} to={to} className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}>
                                    <Icon size={18} /><span>{label}</span>
                                </NavLink>
                            ))}
                            <span className="app-nav-label app-settings-label">System</span>
                            {navigation.slice(6).map(({ to, label, icon: Icon }) => (
                                <NavLink key={to} to={to} className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}>
                                    <Icon size={18} /><span>{label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className="app-user-block">
                            <div className="app-avatar">{initial}</div>
                            <div><strong>{user?.name || "ClubHub user"}</strong><span>{user?.role || "member"}</span></div>
                            <button type="button" onClick={logout} aria-label="Log out"><LogOut size={17} /></button>
                        </div>
                    </div>
                </GlassSurface>
            </aside>
            <main className="app-content"><Outlet /></main>
        </div>
    );
}

export default AppShell;
