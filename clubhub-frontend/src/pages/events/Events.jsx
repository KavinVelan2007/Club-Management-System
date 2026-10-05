import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import { eventService } from "../../services/eventService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import "../../components/ui/PageState.css";
import "../clubs/Clubs.css";
import "./Events.css";

const formatDate = (value, options = { dateStyle: "medium", timeStyle: "short" }) => new Intl.DateTimeFormat(undefined, options).format(new Date(value));

function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]); const [registrations, setRegistrations] = useState([]); const [selected, setSelected] = useState(null); const [state, setState] = useState("loading"); const [error, setError] = useState("");
    const load = useCallback(async () => { setState("loading"); try { const [clubs, ownMemberships] = await Promise.all([clubService.getClubs(), user.role === "student" ? clubService.getMemberships(`?student=${encodeURIComponent(user.userId)}`) : Promise.resolve([])]); const allowedClubIds = new Set(user.role === "student" ? ownMemberships.map((item) => item.club_id) : clubs.filter((club) => club.faculty_id === user.userId).map((club) => club.club_id)); const eventLists = await Promise.all([...allowedClubIds].map((clubId) => eventService.getEvents(`?club=${encodeURIComponent(clubId)}`))); setEvents(eventLists.flat()); if (user.role === "student") setRegistrations(await eventService.getRegistrations(`?student=${encodeURIComponent(user.userId)}`)); setState("ready"); } catch (loadError) { setError(loadError.message); setState("error"); } }, [user.role, user.userId]);
    useEffect(() => { load(); }, [load]);
    const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)), [events]);
    const isRegistered = selected && registrations.find((registration) => registration.event_id === selected.event_id);
    if (state === "loading") return <PageState title="Loading events" message="Fetching events for your clubs…" />;
    if (state === "error") return <PageState type="error" title="Could not load events" message={error} onRetry={load} />;
    if (selected) return <section className="feature-page"><button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={16} /> All events</button><div className="event-detail"><GlassSurface width="100%" borderRadius={22} backgroundOpacity={0.09} blur={13}><article><p className="event-label">{selected.club_name || "CLUB EVENT"}</p><h1>{selected.event_name}</h1><p className="event-description">{selected.description || "No description has been provided for this event."}</p><div className="event-meta"><span><CalendarDays size={17} /> {formatDate(selected.event_date)}</span><span><MapPin size={17} /> {selected.venue}</span><span><Users size={17} /> Capacity {selected.capacity}</span></div><div className="event-registration-status">{user.role === "student" ? (isRegistered ? `Registration: ${isRegistered.status}` : "You are not registered for this event.") : `Event status: ${selected.status}`}</div></article></GlassSurface></div></section>;
    return <section className="feature-page"><div className="page-heading"><div><p>WORKSPACE / EVENTS</p><h1>Events<span>.</span></h1><span>Upcoming and past events from your clubs.</span></div></div>{!sorted.length ? <PageState title="No events to show" message="There are no events associated with your current clubs." /> : <div className="event-grid">{sorted.map((event) => { const past = new Date(event.event_date) < new Date(); return <GlassSurface key={event.event_id} width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}><button className="event-card" onClick={() => setSelected(event)}><div className="event-card-date"><strong>{new Date(event.event_date).getDate()}</strong><span>{new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(event.event_date))}</span></div><div><small>{event.club_name || "Club event"} · {past ? "Past" : "Upcoming"}</small><h2>{event.event_name}</h2><p><MapPin size={14} /> {event.venue}</p><p><CalendarDays size={14} /> {formatDate(event.event_date)}</p></div></button></GlassSurface>; })}</div>}<p className="read-only-note">Event registration and event management controls are not shown because the current backend exposes only read endpoints.</p></section>;
}
export default Events;
