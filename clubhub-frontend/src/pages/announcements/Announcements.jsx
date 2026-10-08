import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { announcementService } from "../../services/announcementService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import Modal from "../../components/ui/Modal";
import { formatDateTime } from "../../utils/time";
import "../../components/ui/PageState.css";
import "../../components/ui/forms.css";
import "../clubs/Clubs.css";
import "./Announcements.css";

function AnnouncementForm({ open, announcement, managedClubs, onClose, onSaved }) {
    const isEdit = Boolean(announcement);
    const [form, setForm] = useState({ club_id: "", title: "", content: "" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError("");
        if (announcement) {
            setForm({ club_id: announcement.club_id, title: announcement.title || "", content: announcement.content || "" });
        } else {
            setForm({ club_id: managedClubs[0]?.club_id || "", title: "", content: "" });
        }
    }, [open, announcement, managedClubs]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!form.club_id) { setError("Choose a club for this announcement."); return; }
        if (!form.title.trim()) { setError("A title is required."); return; }
        if (!form.content.trim()) { setError("Announcement content is required."); return; }
        setSaving(true);
        try {
            if (isEdit) {
                await announcementService.updateAnnouncement(announcement.announcement_id, {
                    title: form.title.trim(),
                    content: form.content.trim(),
                });
            } else {
                await announcementService.createAnnouncement({
                    club_id: form.club_id,
                    title: form.title.trim(),
                    content: form.content.trim(),
                });
            }
            onSaved();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} title={isEdit ? "Edit announcement" : "New announcement"} subtitle="Share club updates with every member." onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                {!isEdit && (
                    <div className="form-field">
                        <label htmlFor="announcement-club">Club</label>
                        <select id="announcement-club" value={form.club_id} onChange={(e) => set("club_id", e.target.value)}>
                            {managedClubs.map((club) => <option key={club.club_id} value={club.club_id}>{club.club_name}</option>)}
                        </select>
                    </div>
                )}
                <div className="form-field">
                    <label htmlFor="announcement-title">Title</label>
                    <input id="announcement-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Practice moved to Friday" maxLength={150} />
                </div>
                <div className="form-field">
                    <label htmlFor="announcement-content">Message</label>
                    <textarea id="announcement-content" value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Write the announcement…" maxLength={1000} />
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Publish"}</button>
                </div>
            </form>
        </Modal>
    );
}

function Announcements() {
    const { profile, isManagerOf } = useAuth();
    const [items, setItems] = useState([]);
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState("");

    const managedClubs = profile?.clubs?.filter((club) => club.is_manager) || [];

    const load = useCallback(async () => {
        setState("loading");
        setActionError("");
        try {
            setItems(await announcementService.getAnnouncements());
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const ordered = useMemo(
        () => [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        [items]
    );

    async function removeAnnouncement(announcement) {
        setBusyId(announcement.announcement_id);
        setActionError("");
        try {
            await announcementService.deleteAnnouncement(announcement.announcement_id);
            setItems((prev) => prev.filter((item) => item.announcement_id !== announcement.announcement_id));
            setConfirmingId(null);
        } catch (deleteError) {
            setActionError(deleteError.message);
        } finally {
            setBusyId(null);
        }
    }

    if (state === "loading") return <PageState title="Loading announcements" message="Fetching updates from your clubs…" />;
    if (state === "error") return <PageState type="error" title="Could not load announcements" message={error} onRetry={load} />;

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>WORKSPACE / ANNOUNCEMENTS</p>
                    <h1>Announcements<span>.</span></h1>
                    <span>Latest notices from your clubs and events.</span>
                </div>
                {managedClubs.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
                        <Plus size={16} /> New announcement
                    </button>
                )}
            </div>
            {actionError && <div className="form-error" style={{ marginBottom: 14 }}>{actionError}</div>}

            {!ordered.length ? (
                <PageState title="No announcements yet" message="There are no announcements associated with your current clubs." />
            ) : (
                <div className="announcement-cards">
                    {ordered.map((announcement) => {
                        const managesThis = isManagerOf(announcement.club_id);
                        return (
                            <GlassSurface key={announcement.announcement_id} width="100%" borderRadius={18} backgroundOpacity={0.08} blur={12}>
                                <article className="announcement-card">
                                    <div className="announcement-icon"><Megaphone size={19} /></div>
                                    <div className="announcement-main">
                                        <small>{announcement.club_name || announcement.club_id}{announcement.event_name ? ` · ${announcement.event_name}` : ""}</small>
                                        <h2>{announcement.title}</h2>
                                        <p>{announcement.content}</p>
                                        <footer>By {announcement.created_by_name || announcement.created_by_id} · {formatDateTime(announcement.created_at)}</footer>
                                        {managesThis && (
                                            confirmingId === announcement.announcement_id ? (
                                                <div className="confirm-row">
                                                    <span>Delete this announcement?</span>
                                                    <span className="confirm-actions">
                                                        <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmingId(null)} disabled={busyId === announcement.announcement_id}>Cancel</button>
                                                        <button type="button" className="btn btn-danger btn-small" onClick={() => removeAnnouncement(announcement)} disabled={busyId === announcement.announcement_id}>
                                                            {busyId === announcement.announcement_id ? "Deleting…" : "Delete"}
                                                        </button>
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="card-actions">
                                                    <button type="button" className="btn btn-ghost btn-small" onClick={() => setModal({ mode: "edit", announcement })}>
                                                        <Pencil size={14} /> Edit
                                                    </button>
                                                    <button type="button" className="btn btn-danger btn-small" onClick={() => setConfirmingId(announcement.announcement_id)}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </article>
                            </GlassSurface>
                        );
                    })}
                </div>
            )}

            <AnnouncementForm
                open={Boolean(modal)}
                announcement={modal?.mode === "edit" ? modal.announcement : null}
                managedClubs={managedClubs}
                onClose={() => setModal(null)}
                onSaved={() => { setModal(null); load(); }}
            />
        </section>
    );
}

export default Announcements;