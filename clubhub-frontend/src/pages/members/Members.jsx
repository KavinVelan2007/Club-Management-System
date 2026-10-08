import { useCallback, useEffect, useState } from "react";
import { Check, Search, Trash2, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import Modal from "../../components/ui/Modal";
import "../../components/ui/PageState.css";
import "../../components/ui/forms.css";
import "../clubs/Clubs.css";
import "./Members.css";

function AddMemberForm({ open, managedClubs, existing, onClose, onSaved }) {
    const [clubId, setClubId] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [picked, setPicked] = useState(null);
    const [roleId, setRoleId] = useState("R003");
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError("");
        setQuery("");
        setResults([]);
        setPicked(null);
        setRoleId("R003");
        setClubId(managedClubs[0]?.club_id || "");
        clubService.getRoles().then(setRoles).catch(() => setRoles([]));
    }, [open, managedClubs]);

    async function search() {
        setSearching(true);
        setError("");
        try {
            setResults(await clubService.getStudents(query.trim()));
        } catch (searchError) {
            setError(searchError.message);
        } finally {
            setSearching(false);
        }
    }

    const alreadyInClub = (studentId) => existing.some(
        (member) => member.club_id === clubId && member.student_id === studentId
    );

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!clubId) { setError("Choose a club first."); return; }
        if (!picked) { setError("Pick a student to add."); return; }
        setSaving(true);
        try {
            await clubService.addMember({ club_id: clubId, student_id: picked.student_id, role_id: roleId });
            onSaved();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} title="Add member" subtitle="Add a student to one of your clubs." onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                <div className="form-field">
                    <label htmlFor="add-member-club">Club</label>
                    <select id="add-member-club" value={clubId} onChange={(e) => { setClubId(e.target.value); setPicked(null); }}>
                        {managedClubs.map((club) => <option key={club.club_id} value={club.club_id}>{club.club_name}</option>)}
                    </select>
                </div>
                <div className="member-search">
                    <div className="form-field">
                        <label htmlFor="add-member-search">Find student</label>
                        <input
                            id="add-member-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Name or student ID…"
                        />
                    </div>
                    <button type="button" className="btn btn-ghost" onClick={search} disabled={searching}>
                        <Search size={15} /> {searching ? "Searching…" : "Search"}
                    </button>
                </div>
                {results.length > 0 && (
                    <div className="assignee-list">
                        {results.map((student) => {
                            const taken = alreadyInClub(student.student_id);
                            return (
                                <button
                                    type="button"
                                    key={student.student_id}
                                    disabled={taken}
                                    onClick={() => setPicked(student)}
                                    className={picked?.student_id === student.student_id ? "student-option picked" : "student-option"}
                                >
                                    <span>{student.name} <small>({student.student_id})</small></span>
                                    <small>{taken ? "Already in club" : student.email}</small>
                                </button>
                            );
                        })}
                    </div>
                )}
                {picked && (
                    <div className="picked-student">
                        <span>Adding <strong>{picked.name}</strong> ({picked.student_id})</span>
                        <button type="button" onClick={() => setPicked(null)} aria-label="Clear selection"><X size={14} /></button>
                    </div>
                )}
                <div className="form-field">
                    <label htmlFor="add-member-role">Role</label>
                    <select id="add-member-role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                        {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
                    </select>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving || !picked}>
                        <UserPlus size={15} /> {saving ? "Adding…" : "Add member"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function Members() {
    const { user, profile, isManagerOf } = useAuth();
    const [members, setMembers] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [clubFilter, setClubFilter] = useState("all");
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [confirmingKey, setConfirmingKey] = useState(null);
    const [busyKey, setBusyKey] = useState(null);
    const [actionError, setActionError] = useState("");
    const [success, setSuccess] = useState("");

    const managedClubs = profile?.clubs?.filter((club) => club.is_manager) || [];
    const canManageAny = managedClubs.length > 0;

    const load = useCallback(async () => {
        setState("loading");
        try {
            const clubData = await clubService.getClubs();
            setClubs(clubData);
            const lists = await Promise.all(
                clubData.map((club) => clubService.getMemberships(`?club=${encodeURIComponent(club.club_id)}`))
            );
            setMembers(lists.flat().map((member) => ({
                ...member,
                club_name: clubData.find((club) => club.club_id === member.club_id)?.club_name,
            })));
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function approve(member) {
        const key = `${member.club_id}-${member.student_id}`;
        setBusyKey(key);
        setActionError("");
        setSuccess("");
        try {
            await clubService.updateMember(member.club_id, member.student_id, { status: "ACTIVE" });
            setMembers((prev) => prev.map((item) => (
                item.club_id === member.club_id && item.student_id === member.student_id
                    ? { ...item, status: "ACTIVE" }
                    : item
            )));
            setSuccess(`${member.student_name || member.student_id} approved.`);
        } catch (approveError) {
            setActionError(approveError.message);
        } finally {
            setBusyKey(null);
        }
    }

    async function remove(member) {
        const key = `${member.club_id}-${member.student_id}`;
        setBusyKey(key);
        setActionError("");
        setSuccess("");
        try {
            await clubService.removeMember(member.club_id, member.student_id);
            setMembers((prev) => prev.filter((item) => !(item.club_id === member.club_id && item.student_id === member.student_id)));
            setConfirmingKey(null);
            setSuccess(`${member.student_name || member.student_id} removed from ${member.club_name}.`);
        } catch (removeError) {
            setActionError(removeError.message);
        } finally {
            setBusyKey(null);
        }
    }

    if (state === "loading") return <PageState title="Loading members" message="Fetching members from your clubs…" />;
    if (state === "error") return <PageState type="error" title="Could not load members" message={error} onRetry={load} />;

    const filtered = clubFilter === "all" ? members : members.filter((member) => member.club_id === clubFilter);
    const pending = filtered.filter((member) => member.status === "PENDING");

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>WORKSPACE / MEMBERS</p>
                    <h1>Members<span>.</span></h1>
                    <span>People in the clubs connected to your account.</span>
                </div>
                {canManageAny && (
                    <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
                        <UserPlus size={16} /> Add member
                    </button>
                )}
            </div>

            {actionError && <div className="form-error" style={{ marginBottom: 14 }}>{actionError}</div>}
            {success && <div className="form-success" style={{ marginBottom: 14 }}>{success}</div>}

            {!clubs.length ? (
                <PageState title="No members to show" message="Join or be assigned to a club to see its members." />
            ) : (
                <MembersTable
                    clubs={clubs}
                    filtered={filtered}
                    pendingCount={pending.length}
                    clubFilter={clubFilter}
                    onFilter={setClubFilter}
                    userId={user.userId}
                    isManagerOf={isManagerOf}
                    busyKey={busyKey}
                    confirmingKey={confirmingKey}
                    onApprove={approve}
                    onAskRemove={setConfirmingKey}
                    onCancelRemove={() => setConfirmingKey(null)}
                    onRemove={remove}
                />
            )}

            <AddMemberForm
                open={addOpen}
                managedClubs={managedClubs}
                existing={members}
                onClose={() => setAddOpen(false)}
                onSaved={() => { setAddOpen(false); setSuccess("Member added."); load(); }}
            />
        </section>
    );
}

function MembersTable({ clubs, filtered, pendingCount, clubFilter, onFilter, userId, isManagerOf, busyKey, confirmingKey, onApprove, onAskRemove, onCancelRemove, onRemove }) {
    return (
        <>
            <div className="page-toolbar">
                <div className="tab-bar" role="tablist" aria-label="Club filter">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={clubFilter === "all"}
                        className={clubFilter === "all" ? "tab active" : "tab"}
                        onClick={() => onFilter("all")}
                    >
                        All clubs
                    </button>
                    {clubs.map((club) => (
                        <button
                            key={club.club_id}
                            type="button"
                            role="tab"
                            aria-selected={clubFilter === club.club_id}
                            className={clubFilter === club.club_id ? "tab active" : "tab"}
                            onClick={() => onFilter(club.club_id)}
                        >
                            {club.club_name}
                        </button>
                    ))}
                </div>
            </div>

            <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                <div className="members-table">
                    <div className="members-table-head">
                        <span>Member</span><span>Club</span><span>Role</span><span>Status</span>
                    </div>
                    {filtered.map((member) => {
                        const key = `${member.club_id}-${member.student_id}`;
                        const managesThis = isManagerOf(member.club_id);
                        const isSelf = member.student_id === userId;
                        return (
                            <div className="member-row member-managed" key={key}>
                                <div><i>{member.student_name?.charAt(0) || "M"}</i><strong>{member.student_name || member.student_id}</strong></div>
                                <span>{member.club_name}</span>
                                <span>{member.role_name || "Member"}</span>
                                <span><span className={`pill ${member.status?.toLowerCase()}`}>{member.status}</span></span>
                                {managesThis && (
                                    <span className="member-actions">
                                        {member.status === "PENDING" && (
                                            <button type="button" className="btn btn-primary btn-small" onClick={() => onApprove(member)} disabled={busyKey === key}>
                                                <Check size={13} /> {busyKey === key ? "…" : "Approve"}
                                            </button>
                                        )}
                                        {member.status !== "PENDING" && !isSelf && confirmingKey !== key && (
                                            <button type="button" className="btn btn-danger btn-small" onClick={() => onAskRemove(key)} disabled={busyKey === key} aria-label={`Remove ${member.student_name || member.student_id}`}>
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                        {member.status !== "PENDING" && !isSelf && confirmingKey === key && (
                                            <span className="confirm-actions">
                                                <button type="button" className="btn btn-ghost btn-small" onClick={onCancelRemove} disabled={busyKey === key}>Keep</button>
                                                <button type="button" className="btn btn-danger btn-small" onClick={() => onRemove(member)} disabled={busyKey === key}>
                                                    {busyKey === key ? "…" : "Remove"}
                                                </button>
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    {!filtered.length && <div className="member-empty"><Users size={22} /> No member records found.</div>}
                </div>
            </GlassSurface>

            {pendingCount > 0 && (
                <p className="inline-notice">
                    {pendingCount} pending request{pendingCount === 1 ? "" : "s"} await{pendingCount === 1 ? "s" : ""} your approval.
                </p>
            )}
        </>
    );
}

export default Members;