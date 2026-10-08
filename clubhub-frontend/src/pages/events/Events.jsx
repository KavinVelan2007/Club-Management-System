import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Plus, Trash2, Users, UserCheck, UserMinus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../services/eventService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import Modal from "../../components/ui/Modal";
import { formatDateTime, toLocalInputValue } from "../../utils/time";
import "../../components/ui/PageState.css";
import "../../components/ui/forms.css";
import "../clubs/Clubs.css";
import "./Events.css";

const EVENT_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

function EventForm({ open, event, managedClubs, onClose, onSaved }) {
    const isEdit = Boolean(event);
    const [form, setForm] = useState({ club_id: "", event_name: "", description: "", venue: "", capacity: 50, event_date: "", status: "UPCOMING" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError("");
        if (event) {
            setForm({
                club_id: event.club_id,
                event_name: event.event_name || "",
                description: event.description || "",
                venue: event.venue || "",
                capacity: event.capacity || 50,
                event_date: toLocalInputValue(event.event_date),
                status: event.status || "UPCOMING",
            });
        } else {
            setForm({
                club_id: managedClubs[0]?.club_id || "",
                event_name: "",
                description: "",
                venue: "",
                capacity: 50,
                event_date: "",
                status: "UPCOMING",
            });
        }
    }, [open, event, managedClubs]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!form.club_id) { setError("Choose a club for this event."); return; }
        if (!form.event_name.trim()) { setError("Event name is required."); return; }
        if (!form.venue.trim()) { setError("Venue is required."); return; }
        if (!form.event_date) { setError("An event date is required."); return; }
        const capacity = Number.parseInt(form.capacity, 10);
        if (!Number.isInteger(capacity) || capacity < 1) { setError("Capacity must be a positive whole number."); return; }
        setSaving(true);
        const payload = {
            event_name: form.event_name.trim(),
            description: form.description.trim(),
            venue: form.venue.trim(),
            capacity,
            event_date: new Date(form.event_date).toISOString(),
            status: form.status,
        };
        try {
            if (isEdit) {
                await eventService.updateEvent(event.event_id, payload);
            } else {
                await eventService.createEvent({ club_id: form.club_id, ...payload });
            }
            onSaved();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} title={isEdit ? "Edit event" : "Create event"} subtitle={isEdit ? event.event_name : "Plan a new event for your club."} onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                {!isEdit && (
                    <div className="form-field">
                        <label htmlFor="event-club">Club</label>
                        <select id="event-club" value={form.club_id} onChange={(e) => set("club_id", e.target.value)}>
                            {managedClubs.map((club) => <option key={club.club_id} value={club.club_id}>{club.club_name}</option>)}
                        </select>
                    </div>
                )}
                <div className="form-field">
                    <label htmlFor="event-name">Event name</label>
                    <input id="event-name" value={form.event_name} onChange={(e) => set("event_name", e.target.value)} placeholder="e.g. Music Night" maxLength={150} />
                </div>
                <div className="form-field">
                    <label htmlFor="event-description">Description</label>
                    <textarea id="event-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this event about?" maxLength={500} />
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="event-date">Date &amp; time</label>
                        <input id="event-date" type="datetime-local" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="event-venue">Venue</label>
                        <input id="event-venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Main Auditorium" maxLength={150} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="event-capacity">Capacity</label>
                        <input id="event-capacity" type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="event-status">Status</label>
                        <select id="event-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
                            {EVENT_STATUSES.map((item) => <option key={item} value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</option>)}
                        </select>
                    </div>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}</button>
                </div>
            </form>
        </Modal>
    );
}

function Events() {
    const { user, profile, isManagerOf } = useAuth();
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [registrationCount, setRegistrationCount] = useState({});
    const [selected, setSelected] = useState(null);
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    const load = useCallback(async () => {
        setState("loading");
        setActionError("");
        try {
            const eventData = await eventService.getEvents();
            setEvents(eventData);
            if (user.role === "student") {
                setRegistrations(await eventService.getRegistrations(`?student=${encodeURIComponent(user.userId)}`));
            } else {
                setRegistrations([]);
            }
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, [user.role, user.userId]);

    useEffect(() => { load(); }, [load]);

    const sorted = useMemo(
        () => [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)),
        [events]
    );

    const refreshSelection = useCallback(async (eventId) => {
        if (user.role === "student") {
            setRegistrations(await eventService.getRegistrations(`?student=${encodeURIComponent(user.userId)}`));
        }
        setEvents((prev) => prev.map((item) => (item.event_id === eventId ? { ...item } : item)));
    }, [user.role, user.userId]);

    const loadRegistrationCount = useCallback(async (eventId) => {
        if (user.role !== "student") {
            try {
                const list = await eventService.getRegistrations(`?event=${encodeURIComponent(eventId)}`);
                setRegistrationCount((prev) => ({
                    ...prev,
                    [eventId]: list.filter((row) => row.status === "REGISTERED").length,
                }));
            } catch {
                // Manager-only count; errors stay silent on the read-only row.
            }
        }
    }, [user.role]);

    const registrationFor = (eventId) => registrations.find(
        (registration) => registration.event_id === eventId && registration.status === "REGISTERED"
    );

    async function register(eventItem) {
        setBusy(true);
        setActionError("");
        try {
            await eventService.register(eventItem.event_id);
            await refreshSelection(eventItem.event_id);
        } catch (registerError) {
            setActionError(registerError.message);
        } finally {
            setBusy(false);
        }
    }

    async function unregister(eventItem) {
        setBusy(true);
        setActionError("");
        try {
            await eventService.unregister(eventItem.event_id);
            await refreshSelection(eventItem.event_id);
        } catch (cancelError) {
            setActionError(cancelError.message);
        } finally {
            setBusy(false);
        }
    }

    async function removeEvent(eventItem) {
        setBusy(true);
        setActionError("");
        try {
            await eventService.deleteEvent(eventItem.event_id);
            setEvents((prev) => prev.filter((item) => item.event_id !== eventItem.event_id));
            setSelected(null);
            setConfirmingDelete(false);
        } catch (deleteError) {
            setActionError(deleteError.message);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        if (selected) loadRegistrationCount(selected.event_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.event_id]);

    const managedClubs = profile?.clubs?.filter((club) => club.is_manager) || [];

    if (state === "loading") return <PageState title="Loading events" message="Fetching events for your clubs…" />;
    if (state === "error") return <PageState type="error" title="Could not load events" message={error} onRetry={load} />;

    if (selected) {
        const mine = registrationFor(selected.event_id);
        const managesThis = isManagerOf(selected.club_id);
        return (
            <section className="feature-page">
                <button className="back-button" onClick={() => { setSelected(null); setActionError(""); setConfirmingDelete(false); }}>
                    <ArrowLeft size={16} /> All events
                </button>
                {actionError && <div className="form-error" style={{ marginBottom: 14 }}>{actionError}</div>}
                <div className="event-detail">
                    <GlassSurface width="100%" borderRadius={22} backgroundOpacity={0.09} blur={13}>
                        <article>
                            <p className="event-label">{selected.club_name || "CLUB EVENT"}</p>
                            <h1>{selected.event_name}</h1>
                            <p className="event-description">{selected.description || "No description has been provided for this event."}</p>
                            <div className="event-meta">
                                <span><CalendarDays size={17} /> {formatDateTime(selected.event_date)}</span>
                                <span><MapPin size={17} /> {selected.venue}</span>
                                <span><Users size={17} /> Capacity {selected.capacity}</span>
                            </div>
                            <div className="event-status-row">
                                <div className="event-registration-status">
                                    {user.role === "student"
                                        ? (mine ? "You are registered for this event." : "You are not registered for this event.")
                                        : `Event status: ${selected.status}`}
                                </div>
                                {user.role !== "student" && managesThis && registrationCount[selected.event_id] !== undefined && (
                                    <div className="event-registration-status muted">
                                        {registrationCount[selected.event_id]} registered
                                    </div>
                                )}
                            </div>
                            <div className="card-actions">
                                {user.role === "student" && !mine && (
                                    <button type="button" className="btn btn-primary" onClick={() => register(selected)} disabled={busy}>
                                        <UserCheck size={15} /> {busy ? "Registering…" : "Register"}
                                    </button>
                                )}
                                {user.role === "student" && mine && (
                                    <button type="button" className="btn btn-ghost" onClick={() => unregister(selected)} disabled={busy}>
                                        <UserMinus size={15} /> {busy ? "Cancelling…" : "Cancel registration"}
                                    </button>
                                )}
                                {managesThis && !confirmingDelete && (
                                    <>
                                        <button type="button" className="btn btn-ghost" onClick={() => setModal({ mode: "edit" })} disabled={busy}>
                                            <Pencil size={15} /> Edit
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(true)} disabled={busy}>
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    </>
                                )}
                                {managesThis && confirmingDelete && (
                                    <div className="confirm-row">
                                        <span>Delete “{selected.event_name}”?</span>
                                        <span className="confirm-actions">
                                            <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmingDelete(false)} disabled={busy}>Keep</button>
                                            <button type="button" className="btn btn-danger btn-small" onClick={() => removeEvent(selected)} disabled={busy}>
                                                {busy ? "Deleting…" : "Confirm delete"}
                                            </button>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </article>
                    </GlassSurface>
                </div>
                <EventForm
                    open={modal?.mode === "edit"}
                    event={selected}
                    managedClubs={[]}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); load(); }}
                />
            </section>
        );
    }

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>WORKSPACE / EVENTS</p>
                    <h1>Events<span>.</span></h1>
                    <span>Upcoming and past events from your clubs.</span>
                </div>
                {managedClubs.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
                        <Plus size={16} /> New event
                    </button>
                )}
            </div>
            {!sorted.length ? (
                <PageState title="No events to show" message="There are no events associated with your current clubs." />
            ) : (
                <div className="event-grid">
                    {sorted.map((event) => {
                        const past = new Date(event.event_date) < new Date();
                        const mine = registrationFor(event.event_id);
                        return (
                            <GlassSurface key={event.event_id} width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                                <button className="event-card" onClick={() => setSelected(event)}>
                                    <div className="event-card-date">
                                        <strong>{new Date(event.event_date).getDate()}</strong>
                                        <span>{new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(event.event_date))}</span>
                                    </div>
                                    <div className="event-card-body">
                                        <small>{event.club_name || "Club event"} · {past ? "Past" : "Upcoming"}{mine ? " · Registered" : ""}</small>
                                        <h2>{event.event_name}</h2>
                                        <p><MapPin size={14} /> {event.venue}</p>
                                        <p><CalendarDays size={14} /> {formatDateTime(event.event_date)}</p>
                                    </div>
                                </button>
                            </GlassSurface>
                        );
                    })}
                </div>
            )}

            <EventForm
                open={modal?.mode === "create"}
                event={null}
                managedClubs={managedClubs}
                onClose={() => setModal(null)}
                onSaved={() => { setModal(null); load(); }}
            />
        </section>
    );
}

export default Events;