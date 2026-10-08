import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./TopBarMenus.css";

function ProfileMenu() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handlePointer = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
        };
        const handleKey = (event) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    const name = user?.name || "ClubHub user";
    const initial = name.trim().charAt(0).toUpperCase() || "C";
    const roleLabel = profile?.role_label || (user?.role === "faculty" ? "Faculty coordinator" : "Club member");

    function logout() {
        setOpen(false);
        signOut();
        navigate("/", { replace: true });
    }

    return (
        <div className="profile-menu" ref={containerRef}>
            <button
                type="button"
                className="profile-menu-trigger"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Open profile menu"
            >
                <span className="profile-menu-avatar">{initial}</span>
                <span className="profile-menu-trigger-text">
                    <strong>{name}</strong>
                    <small>{roleLabel}</small>
                </span>
                <ChevronDown size={15} className={open ? "profile-menu-chevron open" : "profile-menu-chevron"} />
            </button>

            {open && (
                <div className="profile-menu-popover" role="menu">
                    <div className="profile-menu-card">
                        <div className="profile-menu-avatar large">{initial}</div>
                        <div className="profile-menu-identity">
                            <strong>{name}</strong>
                            <span>{user?.email || "No email on file"}</span>
                        </div>
                        <dl className="profile-menu-details">
                            <div>
                                <dt>User ID</dt>
                                <dd>{user?.userId || "—"}</dd>
                            </div>
                            <div>
                                <dt>Role</dt>
                                <dd>{roleLabel}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="profile-menu-actions">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                navigate("/settings");
                            }}
                        >
                            <Settings size={15} />
                            Settings
                        </button>
                        <button type="button" role="menuitem" onClick={logout}>
                            <LogOut size={15} />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;