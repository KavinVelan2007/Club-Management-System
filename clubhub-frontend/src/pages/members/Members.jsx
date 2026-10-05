import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clubService } from "../../services/clubService";
import GlassSurface from "../../components/GlassSurface/GlassSurface";
import PageState from "../../components/ui/PageState";
import "../../components/ui/PageState.css";
import "../clubs/Clubs.css";
import "./Members.css";

function Members() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [state, setState] = useState("loading");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setState("loading");
        try {
            const [clubData, ownMemberships] = await Promise.all([
                clubService.getClubs(),
                user.role === "student" ? clubService.getMemberships(`?student=${encodeURIComponent(user.userId)}`) : Promise.resolve([]),
            ]);
            const visibleClubs = user.role === "student"
                ? clubData.filter((club) => ownMemberships.some((item) => item.club_id === club.club_id))
                : clubData.filter((club) => club.faculty_id === user.userId);
            const lists = await Promise.all(visibleClubs.map((club) => clubService.getMemberships(`?club=${encodeURIComponent(club.club_id)}`)));
            setClubs(visibleClubs);
            setMembers(lists.flat().map((member) => ({ ...member, club_name: visibleClubs.find((club) => club.club_id === member.club_id)?.club_name })));
            setState("ready");
        } catch (loadError) {
            setError(loadError.message);
            setState("error");
        }
    }, [user.role, user.userId]);

    useEffect(() => { load(); }, [load]);
    if (state === "loading") return <PageState title="Loading members" message="Fetching members from your clubs…" />;
    if (state === "error") return <PageState type="error" title="Could not load members" message={error} onRetry={load} />;

    return <section className="feature-page">
        <div className="page-heading"><div><p>WORKSPACE / MEMBERS</p><h1>Members<span>.</span></h1><span>People in the clubs connected to your account.</span></div></div>
        {!clubs.length ? <PageState title="No members to show" message="Join or be assigned to a club to see its members." /> : <>
            <GlassSurface width="100%" borderRadius={20} backgroundOpacity={0.08} blur={12}><div className="members-table">
                <div className="members-table-head"><span>Member</span><span>Club</span><span>Role</span><span>Status</span></div>
                {members.map((member) => <div className="member-row" key={`${member.club_id}-${member.student_id}`}><div><i>{member.student_name?.charAt(0) || "M"}</i><strong>{member.student_name || member.student_id}</strong></div><span>{member.club_name}</span><span>{member.role_name || "Member"}</span><em>{member.status}</em></div>)}
                {!members.length && <div className="member-empty"><Users size={22} /> No member records found.</div>}
            </div></GlassSurface>
            <p className="read-only-note">Member management is not shown because the current backend provides read-only membership endpoints.</p>
        </>}
    </section>;
}

export default Members;
