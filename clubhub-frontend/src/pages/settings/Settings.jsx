import { KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import "../clubs/Clubs.css";
import "./Settings.css";

function Settings() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const logout = () => { signOut(); navigate("/", { replace: true }); };
    return <section className="feature-page"><div className="page-heading"><div><p>SYSTEM / SETTINGS</p><h1>Settings<span>.</span></h1><span>Account and session details currently supported by ClubHub.</span></div></div><div className="settings-grid"><GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}><article className="settings-card"><div className="settings-icon"><UserRound size={20} /></div><h2>Account</h2><dl><div><dt>Name</dt><dd>{user?.name || "Not available"}</dd></div><div><dt>Account ID</dt><dd>{user?.userId || "Not available"}</dd></div><div><dt>Account type</dt><dd className="capitalize">{user?.role || "Not available"}</dd></div></dl></article></GlassSurface><GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}><article className="settings-card"><div className="settings-icon"><ShieldCheck size={20} /></div><h2>Security</h2><p>Your session uses the backend’s JWT access and refresh tokens. Access to ClubHub data is limited to signed-in sessions.</p><button className="settings-action" onClick={logout}><LogOut size={16} /> Sign out of ClubHub</button></article></GlassSurface><GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}><article className="settings-card muted-setting"><div className="settings-icon"><KeyRound size={20} /></div><h2>Password and preferences</h2><p>Password reset, profile editing, and saved preferences are not shown because corresponding backend endpoints have not been implemented yet.</p></article></GlassSurface></div></section>;
}
export default Settings;
