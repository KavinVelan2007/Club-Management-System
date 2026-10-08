import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, ChevronRight, Pencil, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import Modal from "../../components/ui/Modal";
import "../../components/ui/PageState.css";
import "../../components/ui/forms.css";
import "./Clubs.css";

function ClubEditForm({ open, club, onClose, onSaved }) {
    const [form, setForm] = useState({ club_name: "", description: "", category: "" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !club) return;
        setError("");
        setForm({
            club_name: club.club_name || "",
            description: club.description || "",
            category: club.category || "",
        });
    }, [open, club]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!form.club_name.trim()) { setError("Club name is required."); return; }
        setSaving(true);
        try {
            await clubService.updateClub(club.club_id, {
                club_name: form.club_name.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
            });
            onSaved();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    if (!club) return null;

    return (
        <Modal open={open} title="Edit club" subtitle={club.club_name} onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                <div className="form-field">
                    <label htmlFor="club-name">Club name</label>
                    <input id="club-name" value={form.club_name} onChange={(e) => set("club_name", e.target.value)} maxLength={100} />
                </div>
                <div className="form-field">
                    <label htmlFor="club-description">Description</label>
                    <textarea id="club-description" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={500} />
                </div>
                <div className="form-field">
                    <label htmlFor="club-category">Category</label>
                    <input id="club-category" value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={50} />
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                </div>
            </form>
        </Modal>
    );
}

function Clubs() {
    const { user, profile, isManagerOf } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [selected, setSelected] = useState(null);
    const [members, setMembers] = useState([]);
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);

    // Student view of own memberships; faculty see coordination via profile.
    const ownMemberships = profile?.clubs || [];

    const load = useCallback(async () => {
        setState("loading");
        try {
            setClubs(await clubService.getClubs());
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const selectedClub = useMemo(
        () => clubs.find((club) => club.club_id === selected?.club_id) || selected,
        [clubs, selected]
    );
    const selectedMembership = ownMemberships.find(
        (membership) => membership.club_id === selectedClub?.club_id
    );
    const president = members.find((member) => member.role_id === "R001" && member.status === "ACTIVE");
    const managesSelected = selectedClub ? isManagerOf(selectedClub.club_id) : false;

    const openClub = async (club) => {
        setSelected(club);
        setMembers([]);
        try {
            setMembers(await clubService.getMemberships(`?club=${encodeURIComponent(club.club_id)}`));
        } catch (memberError) {
            setError(memberError.message);
        }
    };

    if (state === "loading") return <PageState title="Loading your clubs" message="Fetching your club memberships…" />;
    if (state === "error") return <PageState type="error" title="Could not load clubs" message={error} onRetry={load} />;

    if (selectedClub) {
        return (
            <section className="feature-page">
                <button className="back-button" onClick={() => setSelected(null)}>
                    <ArrowLeft size={16} /> All clubs
                </button>
                <div className="page-heading">
                    <div>
                        <p>CLUB DIRECTORY</p>
                        <h1>{selectedClub.club_name}</h1>
                        <span>{selectedClub.category} · {selectedClub.status}</span>
                    </div>
                    {managesSelected && (
                        <button className="btn btn-ghost" onClick={() => setEditOpen(true)}>
                            <Pencil size={15} /> Edit club
                        </button>
                    )}
                </div>
                <div className="club-detail-grid">
                    <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                        <article className="detail-card">
                            <h2>About this club</h2>
                            <p>{selectedClub.description || "No description has been added yet."}</p>
                            <dl>
                                <div>
                                    <dt>Club president</dt>
                                    <dd>{president ? `${president.student_name || president.student_id} (${president.student_id})` : "Not listed"}</dd>
                                </div>
                                <div>
                                    <dt>Faculty coordinator</dt>
                                    <dd>{selectedClub.faculty_name || "Not listed"}</dd>
                                </div>
                                <div>
                                    <dt>Your role</dt>
                                    <dd>{selectedMembership?.role_name || (user.role === "faculty" ? "Faculty coordinator" : "Member")}</dd>
                                </div>
                            </dl>
                        </article>
                    </GlassSurface>
                    <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                        <article className="detail-card">
                            <h2>Members <span>{members.length}</span></h2>
                            {members.length ? (
                                <ul className="member-mini-list">
                                    {members.map((member) => (
                                        <li key={member.student_id}>
                                            <span>{member.student_name?.charAt(0) || "M"}</span>
                                            <div>
                                                <strong>{member.student_name || member.student_id}</strong>
                                                <small>{member.role_name || "Member"}{member.status === "PENDING" ? " · Pending" : ""}</small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p>No members found for this club.</p>}
                        </article>
                    </GlassSurface>
                </div>
                <ClubEditForm
                    open={editOpen}
                    club={selectedClub}
                    onClose={() => setEditOpen(false)}
                    onSaved={() => { setEditOpen(false); load(); }}
                />
            </section>
        );
    }

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>WORKSPACE / CLUBS</p>
                    <h1>My clubs<span>.</span></h1>
                    <span>Clubs connected to your ClubHub account.</span>
                </div>
            </div>
            {clubs.length === 0 ? (
                <PageState type="empty" title="No clubs to show" message="Your account does not currently have any club memberships or coordinator assignments." />
            ) : (
                <div className="club-grid">
                    {clubs.map((club) => {
                        const roleName = ownMemberships.find((item) => item.club_id === club.club_id)?.role_name;
                        return (
                            <GlassSurface key={club.club_id} width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                                <button className="club-card" onClick={() => openClub(club)}>
                                    <div className="club-card-icon"><Building2 size={21} /></div>
                                    <small>{club.category}</small>
                                    <h2>{club.club_name}</h2>
                                    <p>{club.description || "Explore this club and its membership."}</p>
                                    <footer>
                                        <span><Users size={15} /> {roleName || (user.role === "faculty" ? "Coordinating" : "Member")}</span>
                                        <ChevronRight size={18} />
                                    </footer>
                                </button>
                            </GlassSurface>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Clubs;