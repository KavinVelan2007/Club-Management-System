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
    Bell,
    Search,
    ArrowUpRight,
    Clock3,
    CheckCircle2,
    Circle,
    ChevronRight,
    Activity,
    ShieldCheck,
} from "lucide-react";

import CRTWarp from "../../components/CRTWarp/CRTWarp";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import GradualBlur from "../../components/GradualBlur/GradualBlur";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import { eventService } from "../../services/eventService";
import { taskService } from "../../services/taskService";
import { announcementService } from "../../services/announcementService";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [summary, setSummary] = useState({ clubs: 0, upcoming: 0, completion: 0, announcements: 0 });

    const loadSummary = useCallback(async () => {
        try {
            const [clubs, memberships] = await Promise.all([
                clubService.getClubs(),
                user.role === "student" ? clubService.getMemberships(`?student=${encodeURIComponent(user.userId)}`) : Promise.resolve([]),
            ]);
            const visibleClubs = user.role === "student"
                ? clubs.filter((club) => memberships.some((item) => item.club_id === club.club_id))
                : clubs.filter((club) => club.faculty_id === user.userId);
            const ids = visibleClubs.map((club) => club.club_id);
            const [eventLists, taskLists, announcementLists] = await Promise.all([
                Promise.all(ids.map((id) => eventService.getEvents(`?club=${encodeURIComponent(id)}`))),
                user.role === "student" ? Promise.resolve([await taskService.getTasks(`?student=${encodeURIComponent(user.userId)}`)]) : Promise.all(ids.map((id) => taskService.getTasks(`?club=${encodeURIComponent(id)}`))),
                Promise.all(ids.map((id) => announcementService.getAnnouncements(`?club=${encodeURIComponent(id)}`))),
            ]);
            const tasks = taskLists.flat();
            const completed = tasks.filter((task) => task.status?.toLowerCase().includes("complete")).length;
            setSummary({ clubs: visibleClubs.length, upcoming: eventLists.flat().filter((event) => new Date(event.event_date) >= new Date()).length, completion: tasks.length ? Math.round((completed / tasks.length) * 100) : 0, announcements: announcementLists.flat().length });
        } catch {
            // The individual pages present detailed API errors; the dashboard remains usable with zero-value summaries.
        }
    }, [user.role, user.userId]);

    useEffect(() => { loadSummary(); }, [loadSummary]);
    const userRole = user.role === "faculty" ? "Faculty" : "Student";
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
                                        {userRole}
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
                        />

                    </div>

                    <div className="topbar-actions">

                        <button className="icon-button">

                            <Bell size={19} />

                            <span className="notification-dot" />

                        </button>

                        <div className="topbar-divider" />

                        <div className="profile">

                            <div className="profile-avatar">
                                    {userInitial}
                            </div>

                            <div className="profile-info">

                                <strong>
                                    {userName}
                                </strong>

                                <span>
                                    {userRole}
                                </span>

                            </div>

                            <ChevronRight
                                size={16}
                                className="profile-arrow"
                            />

                        </div>

                    </div>

                </header>

                {/* ================= CONTENT ================= */}

                <div className="dashboard-content">

                    {/* Welcome */}

                    <section className="welcome-section">

                        <div>

                            <p className="eyebrow">
                                CLUBHUB / OVERVIEW
                            </p>

                            <h1>
                                Welcome back<span>.</span>
                            </h1>

                            <p className="welcome-subtitle">
                                Here's what's happening across your clubs today.
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
                                    {String(summary.clubs).padStart(2, "0")}
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
                                    {String(summary.upcoming).padStart(2, "0")}
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
                                    {summary.completion}
                                    <span className="percentage">
                                        %
                                    </span>
                                </div>

                                <div className="stat-footer">

                                    <span className="stat-positive">
                                    {summary.completion}%
                                    </span>

                                    <span>
                                        completion
                                    </span>

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
                                    {String(summary.announcements).padStart(2, "0")}
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

                                    <div className="event-item">

                                        <div className="event-date">
                                            <span>SEP</span>
                                            <strong>08</strong>
                                        </div>

                                        <div className="event-info">

                                            <strong>
                                                Music Club Jam Session
                                            </strong>

                                            <span>
                                                Music Club · 4:00 PM
                                            </span>

                                        </div>

                                        <div className="event-status">

                                            <Clock3 size={14} />

                                            Tomorrow

                                        </div>

                                    </div>


                                    <div className="event-item">

                                        <div className="event-date">
                                            <span>SEP</span>
                                            <strong>11</strong>
                                        </div>

                                        <div className="event-info">

                                            <strong>
                                                Short Film Screening
                                            </strong>

                                            <span>
                                                Short Film Club · 6:30 PM
                                            </span>

                                        </div>

                                        <div className="event-status">

                                            <CalendarDays size={14} />

                                            3 days

                                        </div>

                                    </div>


                                    <div className="event-item">

                                        <div className="event-date">
                                            <span>SEP</span>
                                            <strong>15</strong>
                                        </div>

                                        <div className="event-info">

                                            <strong>
                                                Coding Club Meetup
                                            </strong>

                                            <span>
                                                Coding Club · 3:00 PM
                                            </span>

                                        </div>

                                        <div className="event-status">

                                            <CalendarDays size={14} />

                                            1 week

                                        </div>

                                    </div>

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

                                    <div className="announcement">

                                        <div className="announcement-dot purple-dot" />

                                        <div>

                                            <strong>
                                                Music Club auditions
                                            </strong>

                                            <p>
                                                Audition registrations close this Friday.
                                            </p>

                                            <span>
                                                2 hours ago
                                            </span>

                                        </div>

                                    </div>


                                    <div className="announcement">

                                        <div className="announcement-dot blue-dot" />

                                        <div>

                                            <strong>
                                                Film equipment available
                                            </strong>

                                            <p>
                                                Camera equipment booking is now open.
                                            </p>

                                            <span>
                                                Yesterday
                                            </span>

                                        </div>

                                    </div>


                                    <div className="announcement">

                                        <div className="announcement-dot green-dot" />

                                        <div>

                                            <strong>
                                                Club meeting reminder
                                            </strong>

                                            <p>
                                                Monthly coordinator meeting tomorrow.
                                            </p>

                                            <span>
                                                2 days ago
                                            </span>

                                        </div>

                                    </div>

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
                                            Overall progress
                                        </strong>

                                        <span>
                                            68%
                                        </span>

                                    </div>

                                    <div className="progress-track">

                                        <div
                                            className="progress-fill"
                                            style={{ width: "68%" }}
                                        />

                                    </div>

                                </div>

                                <div className="task-list">

                                    <div className="task-row completed">

                                        <CheckCircle2 size={17} />

                                        <span>
                                            Prepare music club poster
                                        </span>

                                        <small>
                                            Done
                                        </small>

                                    </div>


                                    <div className="task-row">

                                        <Circle size={17} />

                                        <span>
                                            Edit short film teaser
                                        </span>

                                        <small>
                                            Due Sep 10
                                        </small>

                                    </div>


                                    <div className="task-row">

                                        <Circle size={17} />

                                        <span>
                                            Update event registration
                                        </span>

                                        <small>
                                            Due Sep 12
                                        </small>

                                    </div>

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
                                            LIVE
                                        </span>

                                        <h2>
                                            Recent activity
                                        </h2>

                                    </div>

                                    <Activity size={18} />

                                </div>

                                <div className="activity-list">

                                    <div className="activity-item">

                                        <div className="activity-icon">
                                            <CheckCircle2 size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                Task completed
                                            </strong>

                                            <span>
                                                You completed a club task
                                            </span>

                                            <small>
                                                20 min ago
                                            </small>

                                        </div>

                                    </div>


                                    <div className="activity-item">

                                        <div className="activity-icon">
                                            <Users size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                Joined Music Club
                                            </strong>

                                            <span>
                                                Membership approved
                                            </span>

                                            <small>
                                                Yesterday
                                            </small>

                                        </div>

                                    </div>


                                    <div className="activity-item">

                                        <div className="activity-icon">
                                            <ShieldCheck size={15} />
                                        </div>

                                        <div>

                                            <strong>
                                                Event registration
                                            </strong>

                                            <span>
                                                Registered for Jam Session
                                            </span>

                                            <small>
                                                2 days ago
                                            </small>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </GlassSurface>

                    </section>

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
