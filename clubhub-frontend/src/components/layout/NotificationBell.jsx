import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    BellOff,
    CalendarDays,
    CheckCircle2,
    ListTodo,
    Megaphone,
    UserPlus,
    AlertTriangle,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { formatRelative } from "../../utils/time";
import "./TopBarMenus.css";

const TYPE_ICONS = {
    task_assigned: ListTodo,
    task_overdue: AlertTriangle,
    task_completed: CheckCircle2,
    announcement: Megaphone,
    event: CalendarDays,
    member_pending: UserPlus,
};

function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [state, setState] = useState("ready");
    const [error, setError] = useState("");
    const containerRef = useRef(null);

    const load = useCallback(async () => {
        try {
            const data = await notificationService.getNotifications();
            setItems(data.results);
            setUnread(data.unread_count);
            setError("");
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

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

    async function markRead(keys) {
        if (!keys.length) return;
        try {
            await notificationService.markRead(keys);
            await load();
        } catch {
            // Read-state failures are non-fatal; the next refresh retries.
        }
    }

    async function handleOpen() {
        const next = !open;
        setOpen(next);
        if (next) {
            setState("loading");
            await load();
        }
    }

    async function openItem(item) {
        setOpen(false);
        if (!item.read) await markRead([item.key]);
        navigate(item.link || "/dashboard");
    }

    return (
        <div className="notification-bell" ref={containerRef}>
            <button
                type="button"
                className="notification-bell-trigger"
                onClick={handleOpen}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={unread ? `Open notifications (${unread} unread)` : "Open notifications"}
            >
                <Bell size={18} />
                {unread > 0 && <span className="notification-badge">{unread > 9 ? "9+" : unread}</span>}
            </button>

            {open && (
                <div className="notification-popover" role="menu">
                    <header className="notification-header">
                        <div>
                            <strong>Notifications</strong>
                            <span>{unread} unread</span>
                        </div>
                        {items.length > 0 && unread > 0 && (
                            <button type="button" onClick={() => markRead(items.map((item) => item.key))}>
                                Mark all read
                            </button>
                        )}
                    </header>

                    <div className="notification-list">
                        {state === "loading" && <p className="notification-empty">Loading notifications…</p>}
                        {state === "error" && (
                            <div className="notification-empty">
                                <p>{error}</p>
                                <button type="button" onClick={load}>Try again</button>
                            </div>
                        )}
                        {state === "ready" && items.length === 0 && (
                            <p className="notification-empty">
                                <BellOff size={16} />
                                You are all caught up. New club activity will appear here.
                            </p>
                        )}
                        {state === "ready" && items.map((item) => {
                            const Icon = TYPE_ICONS[item.type] || Bell;
                            return (
                                <button
                                    type="button"
                                    key={item.key}
                                    className={item.read ? "notification-item read" : "notification-item"}
                                    onClick={() => openItem(item)}
                                >
                                    <span className={`notification-icon ${item.type}`}>
                                        <Icon size={15} />
                                    </span>
                                    <span className="notification-body">
                                        <span className="notification-message">{item.message}</span>
                                        <span className="notification-meta">
                                            {item.club_name || "ClubHub"}
                                            {" · "}
                                            {formatRelative(item.occurred_at)}
                                        </span>
                                    </span>
                                    {!item.read && <i className="notification-unread-dot" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
