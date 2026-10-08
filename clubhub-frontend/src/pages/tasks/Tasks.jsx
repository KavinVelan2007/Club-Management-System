import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Pencil, Plus, Trash2, Users, Flag, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import { taskService } from "../../services/taskService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import Modal from "../../components/ui/Modal";
import { formatDate, toLocalInputValue } from "../../utils/time";
import "../../components/ui/PageState.css";
import "../../components/ui/forms.css";
import "../clubs/Clubs.css";
import "./Tasks.css";

const TABS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Assigned / Pending" },
    { id: "progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
];

function matchesTab(task, tab) {
    const status = task.status === "ASSIGNED" ? "TODO" : task.status;
    if (tab === "all") return true;
    if (tab === "pending") return status === "TODO";
    if (tab === "progress") return status === "IN_PROGRESS";
    return status === "COMPLETED";
}

function TaskForm({ open, task, managedClubs, membersByClub, defaultClubId, onClose, onSaved }) {
    const isEdit = Boolean(task);
    const [form, setForm] = useState({ club_id: "", title: "", description: "", priority: "MEDIUM", deadline: "", status: "TODO", assignees: [] });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError("");
        if (task) {
            setForm({
                club_id: task.club_id,
                title: task.title || "",
                description: task.description || "",
                priority: task.priority || "MEDIUM",
                deadline: toLocalInputValue(task.deadline),
                status: task.status || "TODO",
                assignees: task.assignees || [],
            });
        } else {
            setForm({
                club_id: defaultClubId || managedClubs[0]?.club_id || "",
                title: "",
                description: "",
                priority: "MEDIUM",
                deadline: "",
                status: "TODO",
                assignees: [],
            });
        }
    }, [open, task, defaultClubId, managedClubs]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const clubMembers = (membersByClub[form.club_id] || []).filter((member) => member.status === "ACTIVE");
    const existingAssignees = task?.assignees || [];

    const toggleAssignee = (studentId) => {
        setForm((prev) => ({
            ...prev,
            assignees: prev.assignees.includes(studentId)
                ? prev.assignees.filter((id) => id !== studentId)
                : [...prev.assignees, studentId],
        }));
    };

    async function submit(event) {
        event.preventDefault();
        setError("");
        if (!form.club_id) { setError("Choose a club for this task."); return; }
        if (!form.title.trim()) { setError("Task title is required."); return; }
        if (!form.deadline) { setError("A due date is required."); return; }
        setSaving(true);
        try {
            if (!isEdit) {
                await taskService.createTask({
                    club_id: form.club_id,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    priority: form.priority,
                    deadline: new Date(form.deadline).toISOString(),
                    status: form.status,
                    assignee_ids: form.assignees,
                });
            } else {
                await taskService.updateTask(task.task_id, {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    priority: form.priority,
                    deadline: new Date(form.deadline).toISOString(),
                    status: form.status,
                });
                const added = form.assignees.filter((id) => !existingAssignees.includes(id));
                const removed = existingAssignees.filter((id) => !form.assignees.includes(id));
                if (added.length) await taskService.assignTask(task.task_id, added);
                for (const studentId of removed) await taskService.unassignTask(task.task_id, studentId);
            }
            onSaved();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} title={isEdit ? "Edit task" : "Create task"} subtitle={isEdit ? task.title : "Assign work to your club members."} onClose={onClose}>
            <form onSubmit={submit} className="form-grid">
                {!isEdit && (
                    <div className="form-field">
                        <label htmlFor="task-club">Club</label>
                        <select id="task-club" value={form.club_id} onChange={(e) => { set("club_id", e.target.value); set("assignees", []); }}>
                            {managedClubs.map((club) => <option key={club.club_id} value={club.club_id}>{club.club_name}</option>)}
                        </select>
                    </div>
                )}
                <div className="form-field">
                    <label htmlFor="task-title">Title</label>
                    <input id="task-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Prepare event playlist" maxLength={150} />
                </div>
                <div className="form-field">
                    <label htmlFor="task-description">Description</label>
                    <textarea id="task-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What needs to be done?" maxLength={500} />
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="task-priority">Priority</label>
                        <select id="task-priority" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label htmlFor="task-deadline">Due date</label>
                        <input id="task-deadline" type="datetime-local" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
                    </div>
                </div>
                {isEdit && (
                    <div className="form-field">
                        <label htmlFor="task-status">Status</label>
                        <select id="task-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
                            <option value="TODO">Assigned / Pending</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                )}
                <div className="form-field">
                    <label>Assign to</label>
                    {clubMembers.length === 0 ? (
                        <p className="form-hint">No active members found for this club.</p>
                    ) : (
                        <div className="assignee-list">
                            {clubMembers.map((member) => (
                                <label key={member.student_id} className="assignee-option">
                                    <input
                                        type="checkbox"
                                        checked={form.assignees.includes(member.student_id)}
                                        onChange={() => toggleAssignee(member.student_id)}
                                    />
                                    <span>{member.student_name || member.student_id}</span>
                                    <small>{member.role_name || "Member"}</small>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Create task"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function Tasks() {
    const { user, profile, isManagerOf } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [memberships, setMemberships] = useState([]);
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");
    const [tab, setTab] = useState("all");
    const [modal, setModal] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState("");

    const managedClubs = profile?.clubs?.filter((club) => club.is_manager) || [];
    const canManageAny = managedClubs.length > 0;

    const load = useCallback(async () => {
        setState("loading");
        setActionError("");
        try {
            const [taskData, assignmentData, membershipData] = await Promise.all([
                taskService.getTasks(),
                taskService.getAssignments(),
                clubService.getMemberships(),
            ]);
            const byTask = {};
            for (const assignment of assignmentData) {
                (byTask[assignment.task_id] ||= []).push(assignment.student_id);
            }
            setTasks(taskData);
            setAssignments(byTask);
            setMemberships(membershipData);
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const nameOf = useCallback((studentId) => {
        if (studentId === user.userId) return "You";
        return memberships.find((m) => m.student_id === studentId)?.student_name || studentId;
    }, [memberships, user.userId]);

    const membersByClub = useMemo(() => {
        const map = {};
        for (const member of memberships) {
            (map[member.club_id] ||= []).push(member);
        }
        return map;
    }, [memberships]);

    const ordered = useMemo(
        () => [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
        [tasks]
    );
    const visible = ordered.filter((task) => matchesTab(task, tab));
    const counts = useMemo(() => ({
        all: ordered.length,
        pending: ordered.filter((t) => matchesTab(t, "pending")).length,
        progress: ordered.filter((t) => matchesTab(t, "progress")).length,
        completed: ordered.filter((t) => matchesTab(t, "completed")).length,
    }), [ordered]);

    async function changeStatus(task, taskStatus) {
        setBusyId(task.task_id);
        setActionError("");
        try {
            const updated = await taskService.updateStatus(task.task_id, taskStatus);
            setTasks((prev) => prev.map((item) => (item.task_id === task.task_id ? { ...item, status: updated.status } : item)));
        } catch (statusError) {
            setActionError(statusError.message);
        } finally {
            setBusyId(null);
        }
    }

    async function removeTask(task) {
        setBusyId(task.task_id);
        setActionError("");
        try {
            await taskService.deleteTask(task.task_id);
            setTasks((prev) => prev.filter((item) => item.task_id !== task.task_id));
            setConfirmingId(null);
        } catch (deleteError) {
            setActionError(deleteError.message);
        } finally {
            setBusyId(null);
        }
    }

    if (state === "loading") return <PageState title="Loading tasks" message="Fetching tasks relevant to your account…" />;
    if (state === "error") return <PageState type="error" title="Could not load tasks" message={error} onRetry={load} />;

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>WORKSPACE / TASKS</p>
                    <h1>{user.role === "student" && !canManageAny ? "My tasks" : "Club tasks"}<span>.</span></h1>
                    <span>Follow assignments from pending through completion.</span>
                </div>
                {canManageAny && (
                    <button className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
                        <Plus size={16} /> New task
                    </button>
                )}
            </div>

            <div className="page-toolbar">
                <div className="tab-bar" role="tablist" aria-label="Task filters">
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === item.id}
                            className={tab === item.id ? "tab active" : "tab"}
                            onClick={() => setTab(item.id)}
                        >
                            {item.label}
                            <span className="tab-count">{counts[item.id]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {actionError && <div className="form-error" style={{ marginBottom: 14 }}>{actionError}</div>}

            {!visible.length ? (
                <PageState
                    title={tab === "completed" ? "No completed tasks yet" : "No tasks to show"}
                    message={tab === "all"
                        ? "There are no task records visible to your account."
                        : "Nothing matches this filter right now."}
                />
            ) : (
                <div className="task-cards">
                    {visible.map((task) => (
                        <TaskCard
                            key={task.task_id}
                            task={task}
                            assigneeIds={assignments[task.task_id] || []}
                            nameOf={nameOf}
                            userId={user.userId}
                            managesThis={isManagerOf(task.club_id)}
                            busy={busyId === task.task_id}
                            confirming={confirmingId === task.task_id}
                            onStatus={(taskStatus) => changeStatus(task, taskStatus)}
                            onEdit={() => setModal({ mode: "edit", task: { ...task, assignees: assignments[task.task_id] || [] } })}
                            onAskDelete={() => setConfirmingId(task.task_id)}
                            onCancelDelete={() => setConfirmingId(null)}
                            onDelete={() => removeTask(task)}
                        />
                    ))}
                </div>
            )}

            <TaskForm
                open={Boolean(modal)}
                task={modal?.mode === "edit" ? modal.task : null}
                managedClubs={managedClubs}
                membersByClub={membersByClub}
                defaultClubId={managedClubs[0]?.club_id}
                onClose={() => setModal(null)}
                onSaved={() => { setModal(null); load(); }}
            />
        </section>
    );
}

function TaskCard({ task, assigneeIds, nameOf, userId, managesThis, busy, confirming, onStatus, onEdit, onAskDelete, onCancelDelete, onDelete }) {
    const done = task.status === "COMPLETED";
    const inProgress = task.status === "IN_PROGRESS";
    const overdue = !done && task.deadline && new Date(task.deadline) < new Date();
    const isMine = assigneeIds.includes(userId);
    const canAct = isMine || managesThis;

    return (
        <GlassSurface width="100%" borderRadius={17} backgroundOpacity={0.08} blur={12}>
            <article className="task-card">
                <div className={done ? "task-status done" : inProgress ? "task-status progress" : "task-status"}>
                    {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="task-main">
                    <div className="task-topline">
                        <small>{task.club_name || task.club_id}</small>
                        <span className="task-pills">
                            <span className={`pill ${(task.priority || "MEDIUM").toLowerCase()}`}>{task.priority || "MEDIUM"}</span>
                            <span className={`pill ${done ? "completed" : inProgress ? "in_progress" : "todo"}${overdue ? " overdue" : ""}`}>
                                {overdue ? "Overdue" : task.status === "TODO" ? "Assigned" : inProgress ? "In progress" : "Completed"}
                            </span>
                        </span>
                    </div>
                    <h2>{task.title}</h2>
                    <p>{task.description || "No task description provided."}</p>
                    <footer>
                        <span><Flag size={14} /> Due {formatDate(task.deadline)}</span>
                        <span><UserRound size={14} /> {assigneeIds.length ? assigneeIds.map(nameOf).join(", ") : "Unassigned"}</span>
                        <span><Users size={14} /> {task.club_name || task.club_id}</span>
                    </footer>

                    {(canAct || confirming) && (
                        confirming ? (
                            <div className="confirm-row">
                                <span>Delete “{task.title}”? This cannot be undone.</span>
                                <span className="confirm-actions">
                                    <button type="button" className="btn btn-ghost btn-small" onClick={onCancelDelete} disabled={busy}>Cancel</button>
                                    <button type="button" className="btn btn-danger btn-small" onClick={onDelete} disabled={busy}>
                                        {busy ? "Deleting…" : "Delete"}
                                    </button>
                                </span>
                            </div>
                        ) : (
                            <div className="card-actions">
                                {isMine && !inProgress && !done && (
                                    <button type="button" className="btn btn-ghost btn-small" onClick={() => onStatus("IN_PROGRESS")} disabled={busy}>Start</button>
                                )}
                                {isMine && inProgress && (
                                    <button type="button" className="btn btn-ghost btn-small" onClick={() => onStatus("TODO")} disabled={busy}>Pause</button>
                                )}
                                {canAct && !done && (
                                    <button type="button" className="btn btn-primary btn-small" onClick={() => onStatus("COMPLETED")} disabled={busy}>
                                        <CheckCircle2 size={14} /> {busy ? "Saving…" : "Complete"}
                                    </button>
                                )}
                                {managesThis && (
                                    <>
                                        <button type="button" className="btn btn-ghost btn-small" onClick={onEdit}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button type="button" className="btn btn-danger btn-small" onClick={onAskDelete}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )
                    )}
                </div>
            </article>
        </GlassSurface>
    );
}

export default Tasks;
