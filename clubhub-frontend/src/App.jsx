import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Clubs from "./pages/clubs/Clubs";
import Members from "./pages/members/Members";
import Events from "./pages/events/Events";
import Tasks from "./pages/tasks/Tasks";
import Announcements from "./pages/announcements/Announcements";
import Settings from "./pages/settings/Settings";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route element={<AppShell />}>
                        <Route path="/clubs" element={<Clubs />} />
                        <Route path="/members" element={<Members />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/announcements" element={<Announcements />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
