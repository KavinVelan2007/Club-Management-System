import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    CheckSquare,
    Megaphone,
    Settings,
    LogOut,
    Search,
    ArrowUpRight,
    CheckCircle2,
    Circle,
    Activity,
    Clock3,
    ShieldCheck,
    AlertTriangle,
} from "lucide-react";

import CRTWarp from "../../components/CRTWarp/CRTWarp";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import GradualBlur from "../../components/GradualBlur/GradualBlur";
import NotificationBell from "../../components/layout/NotificationBell";
import ProfileMenu from "../../components/layout/ProfileMenu";
import PageState from "../../components/ui/PageState";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { formatDate, formatRelative } from "../../utils/time";

import "./Dashboard.css";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const DOTS = ["purple-dot", "blue-dot", "green-dot", "orange-dot"];

function eventDateParts(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return { month: MONTHS[date.getMonth()], day: String(date.getDate()).padStart(2, "0") };
}

function Dashboard() {
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [search, setSearch] = useState("");

    const loadSummary = useCallback(async () => {
        try {
            setSummary(await authService.getDashboard());
            setLoadError("");
        } catch (loadErr) {
            setLoadError(loadErr.message);
        }
    }, []);

    useEffect(() => { loadSummary(); }, [loadSummary]);

    const roleLabel = profile?.role_label || summary?.role_label || (user.role === "faculty" ? "Faculty coordinator" : "Club member");
    const stats = summary?.stats || { clubs: 0, members: 0, upcoming_events: 0, open_tasks: 0, announcements: 0 };
    const progress = summary?.progress || { completed: 0, total: 0, percent: 0 };
    const upcomingEvents = summary?.upcoming_events || [];
    const recentAnnouncements = summary?.recent_announcements || [];
    const focusTasks = summary?.focus_tasks || [];
    const clubsSummary = summary?.clubs_summary || [];
    const isManager = (profile?.managed_club_ids?.length || 0) > 0;
    const pendingMembers = stats.pending_members || 0;

    const userName = user.name || "ClubHub user";
    const userInitial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        signOut();
        navigate("/");
    };

    return (
        <div className="dashboard">

            {/* ================= BACKGROUND ================= */}

            <div className="dashboard-background">
                <CRTWarp
                    color="#9b4dff"
                    backgroundColor="#05030a"
                    speed={0.35}
                    curvature={0.22}
                    scanlineStrength={0.18}
                    scanlineFrequency={180}
                    waveAmplitude={0.22}
                    waveFrequency={2.2}
                    bloom={1.15}
                    bloomRadius={0.8}
                    noise={0.055}
                    vignette={0.7}
                    brightness={1.05}
                    rgbShift={0.008}
                    mouseReact={true}
                    mouseStrength={0.35}
                    dpr={1}
                    fps={30}
                />
            </div>

            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar-wrapper">
                <GlassSurface
                    width="100%"
                    height="100%"
                    borderRadius={24}
                    backgroundOpacity={0.12}
                    brightness={18}
                    opacity={0.9}
                    blur={12}
                    distortionScale={-80}
                    className="sidebar-glass"
                >
                    <div className="sidebar">

                        {/* Logo */}

                        <div className="brand">

                            <div className="brand-icon">
                                C
                            </div>

                            <div className="brand-name">
                                <span className="brand-club">
                                    Club
                                </span>
                                <span className="brand-hub">
                                    Hub
                                </span>
                            </div>

                        </div>

                        {/* Navigation */}

                        <nav className="sidebar-nav">

                            <div className="nav-section-label">
                                Workspace
                            </div>

                            <button className="nav-item active">
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>

                            <button className="nav-item" onClick={() => navigate("/clubs")}>
                                <Users size={18} />
                                <span>My Clubs</span>
                            </button>

                            <button className="nav-item" onClick={() => navigate("/members")}>
                                <Users size={18} />
                                <span>Members</span>
                            </button>

                            <button className="nav-item" onClick={() => navigate("/events")}>
                                <CalendarDays size={18} />
                                <span>Events</span>
                            </button>

                            <button className="nav-item" onClick={() => navigate("/tasks")}>
                                <CheckSquare size={18} />
                                <span>Tasks</span>
                            </button>

                            <button className="nav-item" onClick={() => navigate("/announcements")}>
                                <Megaphone size={18} />
                                <span>Announcements</span>
                            </button>

                            <div className="nav-section-label settings-label">
                                System
                            </div>

                            <button className="nav-item" onClick={() => navigate("/settings")}>
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>

                        </nav>

                        {/* Bottom user */}

                        <div className="sidebar-bottom">

                            <div className="mini-user">

                                <div className="mini-avatar">
                                    {userInitial}
                                </div>

                                <div className="mini-user-info">
                                    <strong>
                                        {userName}
                                    </strong>

                                    <span>
                                        {roleLabel}
                                    </span>
                                </div>

                            </div>

                            <button
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                                <span>
                                    Log out
                                </span>
                            </button>

                        </div>

                    </div>
                </GlassSurface>
            </aside>

            {/* ================= MAIN ================= */}

            <main className="dashboard-main">

                {/* Top bar */}

                <header className="topbar">

                    <div className="search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search clubs, events, tasks..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                    </div>

                    <div className="topbar-actions">

                        <NotificationBell />

                        <div className="topbar-divider" />

                        <ProfileMenu />

                    </div>

                </header>

                {/* ================= CONTENT ================= */}

                <div className="dashboard-content">

                    {!summary && !loadError ? (
                        <PageState
                            type="loading"
                            title="Loading your dashboard"
                            message="Fetching your clubs, events, tasks and announcements."
                        />
                    ) : loadError && !summary ? (
                        <PageState
                            type="error"
                            title="Dashboard unavailable"
                            message={loadError}
                            onRetry={loadSummary}
                        />
                    ) : (
                        <>

                    {loadError && (
                        <div className="panel-empty">
                            <AlertTriangle size={14} />
                            {loadError}
                        </div>
                    )}

                    {/* Welcome */}

                    <section className="welcome-section">

                        <div>

                            <p className="eyebrow">
                                CLUBHUB / {roleLabel.toUpperCase()}
                            </p>

                            <h1>
                                Welcome back<span>.</span>
                            </h1>

                            <p className="welcome-subtitle">
                                {isManager
                                    ? "Here is what needs your attention across the clubs you manage."
                                    : "Here's what's happening across your clubs today."}
                            </p>

                        </div>

                        <button className="quick-action" onClick={() => navigate("/clubs")}>

                            <span>
                                Explore clubs
                            </span>

                            <ArrowUpRight size={17} />

                        </button>

                    </section>

                    {/* ================= STATS ================= */}

                    <section className="stats-grid">

                        {/* My Clubs */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={20}
                            backgroundOpacity={0.04}
                            brightness={10}
                            blur={10}
                            distortionScale={-70}
                            className="dashboard-glass"
                        >
                            <div className="stat-card">

                                <div className="stat-top">

                                    <div className="stat-icon purple">
                                        <Users size={19} />
                                    </div>

                                    <span className="stat-label">
                                        MY CLUBS
                                    </span>

                                </div>

                                <div className="stat-value">
                                    {String(stats.clubs).padStart(2, "0")}
                                </div>

                                <div className="stat-footer">

                                    <span className="stat-positive">
                                        Active
                                    </span>

                                    <span>
                                        memberships
                                    </span>

                                </div>

                            </div>
                        </GlassSurface>


                        {/* Upcoming */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={20}
                            backgroundOpacity={0.10}
                            brightness={20}
                            blur={10}
                            distortionScale={-70}
                            className="dashboard-glass"
                        >
                            <div className="stat-card">

                                <div className="stat-top">

                                    <div className="stat-icon blue">
                                        <CalendarDays size={19} />
                                    </div>

                                    <span className="stat-label">
                                        UPCOMING
                                    </span>

                                </div>

                                <div className="stat-value">
                                    {String(stats.upcoming_events).padStart(2, "0")}
                                </div>

                                <div className="stat-footer">

                                    <span>
                                        events
                                    </span>

                                    <span>
                                        this week
                                    </span>

                                </div>

                            </div>
                        </GlassSurface>


                        {/* Tasks */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={20}
                            backgroundOpacity={0.10}
                            brightness={20}
                            blur={10}
                            distortionScale={-70}
                            className="dashboard-glass"
                        >
                            <div className="stat-card">

                                <div className="stat-top">

                                    <div className="stat-icon green">
                                        <CheckSquare size={19} />
                                    </div>

                                    <span className="stat-label">
                                        TASKS
                                    </span>

                                </div>

                                <div className="stat-value">
                                    {progress.percent}
                                    <span className="percentage">
                                        %
                                    </span>
                                </div>

                                <div className="stat-footer">

                                    <span className="stat-positive">
                                    {progress.percent}%
                                    </span>

                                    <span>
                                        completion
                                    </span>

                                    {progress.total > 0 && (
                                        <span>
                                            {progress.completed} of {progress.total} tasks
                                        </span>
                                    )}

                                </div>

                            </div>
                        </GlassSurface>


                        {/* Updates */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={20}
                            backgroundOpacity={0.10}
                            brightness={20}
                            blur={10}
                            distortionScale={-70}
                            className="dashboard-glass"
                        >
                            <div className="stat-card">

                                <div className="stat-top">

                                    <div className="stat-icon orange">
                                        <Megaphone size={19} />
                                    </div>

                                    <span className="stat-label">
                                        UPDATES
                                    </span>

                                </div>

                                <div className="stat-value">
                                    {String(stats.announcements).padStart(2, "0")}
                                </div>

                                <div className="stat-footer">

                                    <span>
                                        new
                                    </span>

                                    <span>
                                        announcements
                                    </span>

                                </div>

                            </div>
                        </GlassSurface>

                        {/* Members — managers only */}

                        {isManager && (
                            <GlassSurface
                                width="100%"
                                height="100%"
                                borderRadius={20}
                                backgroundOpacity={0.08}
                                brightness={16}
                                blur={10}
                                distortionScale={-70}
                                className="dashboard-glass"
                            >
                                <div className="stat-card">

                                    <div className="stat-top">

                                        <div className="stat-icon blue">
                                            <Users size={19} />
                                        </div>

                                        <span className="stat-label">
                                            MEMBERS
                                        </span>

                                    </div>

                                    <div className="stat-value">
                                        {String(stats.members).padStart(2, "0")}
                                    </div>

                                    <div className="stat-footer">

                                        <span>
                                            across
                                        </span>

                                        <span>
                                            your clubs
                                        </span>

                                    </div>

                                </div>
                            </GlassSurface>
                        )}

                        {/* Pending membership requests — managers only */}

                        {isManager && pendingMembers > 0 && (
                            <GlassSurface
                                width="100%"
                                height="100%"
                                borderRadius={20}
                                backgroundOpacity={0.08}
                                brightness={16}
                                blur={10}
                                distortionScale={-70}
                                className="dashboard-glass"
                            >
                                <div className="stat-card">

                                    <div className="stat-top">

                                        <div className="stat-icon orange">
                                            <AlertTriangle size={19} />
                                        </div>

                                        <span className="stat-label">
                                            PENDING
                                        </span>

                                    </div>

                                    <div className="stat-value">
                                        {String(pendingMembers).padStart(2, "0")}
                                    </div>

                                    <div className="stat-footer">

                                        <button
                                            type="button"
                                            className="panel-link"
                                            onClick={() => navigate("/members")}
                                        >
                                            Review join requests
                                            <ArrowUpRight size={15} />
                                        </button>

                                    </div>

                                </div>
                            </GlassSurface>
                        )}

                    </section>


                    {/* ================= MAIN GRID ================= */}

                    <section className="main-grid">

                        {/* Upcoming Events */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={22}
                            backgroundOpacity={0.045}
                            brightness={10}
                            blur={12}
                            distortionScale={-85}
                            className="dashboard-glass"
                        >
                            <div className="panel events-panel">

                                <div className="panel-header">

                                    <div>

                                        <span className="panel-kicker">
                                            SCHEDULE
                                        </span>

                                        <h2>
                                            Upcoming events
                                        </h2>

                                    </div>

                                    <button className="panel-link" onClick={() => navigate("/events")}>
                                        View all
                                        <ArrowUpRight size={15} />
                                    </button>

                                </div>

                                <div className="events-list">
                                    {upcomingEvents.length === 0 && (
                                        <p className="panel-empty">
                                            No upcoming events scheduled for your clubs.
                                        </p>
                                    )}

                                    {upcomingEvents.map((event) => {
                                        const parts = eventDateParts(event.event_date);
                                        return (
                                            <div className="event-item" key={event.event_id}>

                                                <div className="event-date">
                                                    <span>{parts ? parts.month : "â€”"}</span>
                                                    <strong>{parts ? parts.day : "--"}</strong>
                                                </div>

                                                <div className="event-info">

                                                    <strong>
                                                        {event.event_name}
                                                    </strong>

                                                    <span>
                                                        {event.club_name}
                                                        {event.venue ? ` Â· ${event.venue}` : ""}
                                                    </span>

                                                </div>

                                                <div className="event-status">

                                                    <Clock3 size={14} />

                                                    {formatRelative(event.event_date)}

                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </GlassSurface>


                        {/* Announcements */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={22}
                            backgroundOpacity={0.11}
                            brightness={18}
                            blur={12}
                            distortionScale={-85}
                            className="dashboard-glass"
                        >
                            <div className="panel announcements-panel">

                                <div className="panel-header">

                                    <div>

                                        <span className="panel-kicker">
                                            NOTICEBOARD
                                        </span>

                                        <h2>
                                            Announcements
                                        </h2>

                                    </div>

                                    <button className="panel-link" onClick={() => navigate("/announcements")}>
                                        View all
                                        <ArrowUpRight size={15} />
                                    </button>

                                </div>

                                <div className="announcement-list">

                                    {recentAnnouncements.length === 0 && (
                                        <p className="panel-empty">
                                            No announcements yet for your clubs.
                                        </p>
                                    )}

                                    {recentAnnouncements.map((announcement, index) => (
                                        <div className="announcement" key={announcement.announcement_id}>
                                            <div className={`announcement-dot ${DOTS[index % DOTS.length]}`} />
                                            <div>
                                                <strong>
                                                    {announcement.title}
                                                </strong>

                                                <p>
                                                    {announcement.content}
                                                </p>

                                                <span>
                                                    {announcement.club_name} Â· {formatRelative(announcement.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                </div>

                            </div>
                        </GlassSurface>

                    </section>


                    {/* ================= BOTTOM GRID ================= */}

                    <section className="bottom-grid">

                        {/* Task Progress */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={22}
                            backgroundOpacity={0.11}
                            brightness={18}
                            blur={12}
                            distortionScale={-85}
                            className="dashboard-glass"
                        >
                            <div className="panel task-panel">

                                <div className="panel-header">

                                    <div>

                                        <span className="panel-kicker">
                                            PRODUCTIVITY
                                        </span>

                                        <h2>
                                            My tasks
                                        </h2>

                                    </div>

                                    <button className="panel-link" onClick={() => navigate("/tasks")}>
                                        Open tasks
                                        <ArrowUpRight size={15} />
                                    </button>

                                </div>

                                <div className="task-progress">

                                    <div className="progress-heading">

                                        <strong>
                                            {isManager ? "Club task progress" : "My task progress"}
                                        </strong>

                                        <span>
                                            {progress.percent}%
                                        </span>

                                    </div>

                                    <div className="progress-track">

                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress.percent}%` }}
                                        />

                                    </div>

                                </div>

                                <div className="task-list">

                                    {focusTasks.length === 0 && (
                                        <p className="panel-empty">
                                            {isManager
                                                ? "No open tasks across your clubs. Nice work."
                                                : "You have no open tasks. Enjoy the quiet."}
                                        </p>
                                    )}

                                    {focusTasks.map((task) => (
                                        <div
                                            className={`task-row${task.status === "COMPLETED" ? " completed" : ""}`}
                                            key={task.task_id}
                                        >

                                            {task.status === "COMPLETED"
                                                ? <CheckCircle2 size={17} />
                                                : <Circle size={17} />}

                                            <span>
                                                {task.title}
                                            </span>

                                            <small>
                                                {task.deadline ? formatDate(task.deadline) : task.status}
                                                {task.club_name ? ` Â· ${task.club_name}` : ""}
                                            </small>

                                        </div>
                                    ))}

                                </div>
                            </div>
                        </GlassSurface>


                        {/* Activity */}

                        <GlassSurface
                            width="100%"
                            height="100%"
                            borderRadius={22}
                            backgroundOpacity={0.11}
                            brightness={18}
                            blur={12}
                            distortionScale={-85}
                            className="dashboard-glass"
                        >
                            <div className="panel activity-panel">

                                <div className="panel-header">

                                    <div>

                                        <span className="panel-kicker">
                                            {isManager ? "OVERVIEW" : "LIVE"}
                                        </span>

                                        <h2>
                                            {isManager ? "Your clubs" : "Recent activity"}
                                        </h2>

                                    </div>

                                    {isManager
                                        ? <ShieldCheck size={18} />
                                        : <Activity size={18} />}

                                </div>

                                <div className="activity-list">

                                    {isManager && pendingMembers > 0 && (
                                        <div className="activity-item">
                                            <div className="activity-icon">
                                                <Users size={15} />
                                            </div>
                                            <div>
                                                <strong>
                                                    {pendingMembers} membership request{pendingMembers === 1 ? "" : "s"} pending
                                                </strong>
                                                <span>
                                                    Review join requests for the clubs you manage
                                                </span>
                                                <button
                                                    type="button"
                                                    className="panel-link"
                                                    onClick={() => navigate("/members")}
                                                >
                                                    Review members
                                                    <ArrowUpRight size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {clubsSummary.length === 0 && (
                                        <p className="panel-empty">
                                            You are not a member of any club yet.
                                        </p>
                                    )}

                                    {clubsSummary.map((club) => (
                                        <div className="activity-item" key={club.club_id}>

                                            <div className="activity-icon">
                                                <Users size={15} />
                                            </div>

                                            <div>
                                                <strong>
                                                    {club.club_name}
                                                </strong>

                                                <span>
                                                    {club.role_name} Â· {club.member_count} member
                                                    {club.member_count === 1 ? "" : "s"}
                                                </span>

                                                {club.category && (
                                                    <small>
                                                        {club.category}
                                                    </small>
                                                )}
                                            </div>

                                        </div>
                                    ))}

                                </div>

                            </div>
                        </GlassSurface>

                    </section>

                        </>
                    )}

                </div>

            </main>


            {/* ================= BOTTOM BLUR ================= */}

            <GradualBlur
                position="bottom"
                strength={2}
                height="5rem"
                divCount={5}
                curve="ease-out"
                opacity={0.9}
                zIndex={20}
                className="dashboard-bottom-blur"
            />

        </div>
    );
}

export default Dashboard;
