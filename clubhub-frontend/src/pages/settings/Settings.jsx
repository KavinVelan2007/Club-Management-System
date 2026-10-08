import { KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import { authService } from "../../services/authService";
import "./Settings.css";

function Settings() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const logout = () => { signOut(); navigate("/", { replace: true }); };

    const [mode, setMode] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const activeProfile = profile || user;

    const defaultProfile = { name: user?.name || "", email: user?.email || "" };
    const [form, setForm] = useState(defaultProfile);

    const startProfile = () => {
        setForm({ name: user?.name || "", email: user?.email || "" });
        setMode("profile");
        setError("");
        setSaved(false);
    };

    const saveProfile = async () => {
        setSaving(true); setError("");
        try {
            await authService.updateProfile({ name: form.name, email: form.email });
            setSaved(true); setTimeout(() => setMode(null), 1500);
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const startPassword = () => { setForm({ old: "", next: "", confirm: "" }); setMode("password"); setError(""); setSaved(false); };

    const savePassword = async () => {
        setSaving(true); setError("");
        if (form.next !== form.confirm) { setError("New passwords do not match."); setSaving(false); return; }
        try {
            await authService.changePassword({ old_password: form.old, new_password: form.next });
            setSaved(true); setForm({ old: "", next: "", confirm: "" }); setTimeout(() => setMode(null), 1500);
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const cancel = () => { setMode(null); setError(""); setSaved(false); };

    const renderOverview = () => {
        return (
            <div className="settings-grid">
                <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                    <article className="settings-card">
                        <div className="settings-icon"><UserRound size={20} /></div>
                        <h2>Account</h2>
                        <dl>
                            <div><dt>Name</dt><dd>{user?.name || "Not available"}</dd></div>
                            <div><dt>Account ID</dt><dd>{user?.userId || "Not available"}</dd></div>
                            <div><dt>Account type</dt><dd className="capitalize">{user?.role || "Not available"}</dd></div>
                            <div><dt>Email</dt><dd>{user?.email || "Not available"}</dd></div>
                        </dl>
                        {activeProfile && (
                            <div className="settings-meta">
                                <span>Clubs managed: {activeProfile.managed_club_ids?.length || 0}</span>
                                <span>Coordinated clubs: {activeProfile.coordinated_club_ids?.length || 0}</span>
                            </div>
                        )}
                        <button className="settings-action" onClick={startProfile}><UserRound size={16} /> Edit profile</button>
                    </article>
                </GlassSurface>
                <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                    <article className="settings-card">
                        <div className="settings-icon"><ShieldCheck size={20} /></div>
                        <h2>Security</h2>
                        <p>Your session uses the backend JWT access and refresh tokens.</p>
                        <button className="settings-action" onClick={startPassword}><Lock size={16} /> Change password</button>
                    </article>
                </GlassSurface>
                <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
                    <article className="settings-card muted-setting">
                        <div className="settings-icon"><KeyRound size={20} /></div>
                        <h2>Session</h2>
                        <p>ClubHub stores your access and refresh tokens in session storage.</p>
                    </article>
                </GlassSurface>
            </div>
        );

    const renderProfile = () => (
        <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
            <article className="settings-card">
                <div className="settings-head">
                    <div><h2>Profile</h2><p>Update your display name and email address.</p></div>
                    {saved ? <CheckCircle2 size={18} className="settings-control-saved" /> : <Save size={18} className="settings-control" />}
                </div>
                {error && <div className="settings-alert">{error}</div>}
                <dl>
                    <div><dt>Name</dt><dd className="settings-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></dd></div>
                    <div><dt>Email</dt><dd className="settings-input"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" /></dd></div>
                </dl>
                <div className="settings-row">
                    <button className="settings-action" onClick={cancel}>Cancel</button>
                    <button className="settings-action primary" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                </div>
            </article>
        </GlassSurface>
    );

    const renderPassword = () => (
        <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}>
            <article className="settings-card">
                <div className="settings-head">
                    <div><h2>Change password</h2><p>Enter your current password, then choose a new one.</p></div>
                    {saved ? <CheckCircle2 size={18} className="settings-control-saved" /> : <Lock size={18} className="settings-control" />}
                </div>
                {error && <div className="settings-alert">{error}</div>}
                <dl>
                    <div><dt>Current password</dt><dd className="settings-input"><input type="password" value={form.old} onChange={(e) => setForm({ ...form, old: e.target.value })} placeholder="Current password" /></dd></div>
                    <div><dt>New password</dt><dd className="settings-input"><input type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} placeholder="New password" /></dd></div>
                    <div><dt>Confirm new password</dt><dd className="settings-input"><input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm new password" /></dd></div>
                </dl>
                <div className="settings-row">
                    <button className="settings-action" onClick={cancel}>Cancel</button>
                    <button className="settings-action primary" onClick={savePassword} disabled={saving}>{saving ? "Saving..." : "Update password"}</button>
                </div>
            </article>
        </GlassSurface>
    );

    const renderSettings = () => {
        if (mode === "profile") return renderProfile();
        if (mode === "password") return renderPassword();
        return renderOverview();
    };

    return (
        <section className="feature-page">
            <div className="page-heading">
                <div>
                    <p>SYSTEM / SETTINGS</p>
                    <h1>Settings<span>.</span></h1>
                    <span>Account and session details currently supported by ClubHub.</span>
                </div>
            </div>
            {renderSettings()}
        </section>
    );
}

export default Settings;
    };
