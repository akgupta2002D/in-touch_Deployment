import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import LandingPage from "./pages/Landing-Page.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CompleteProfile from "./pages/Complete-Profile.jsx";
import ProfilePage from "./profile/Profile-Page.jsx";
import { ensureCsrf, setAccessToken } from "./services/api.js";
import NavBar from "./components/NavBar.jsx";
import Connections from "./connections/ConnectionPage.jsx";
import ConnectionsMap from "./connections_map/ConnectionsMapPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authInfo, setAuthInfo] = useState("");
  const navigate = useNavigate();

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // Fetch CSRF token early to avoid first-POST failures
  useEffect(() => {
    ensureCsrf();
  }, []);

  // After Google callback, token and needsUsername may be in the URL
  const googleParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  useEffect(() => {
    const token = googleParams.get("token");
    const needsUsername = googleParams.get("needsUsername") === "true";
    if (token) {
      // Store token in memory or app state later. For now, just show success.
      setAccessToken(token);
      if (needsUsername) {
        navigate("/complete-profile");
      } else {
        navigate("/profile");
      }
      // Optionally clean URL (no router changes here to keep it simple)
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      url.searchParams.delete("needsUsername");
      window.history.replaceState({}, "", url);
    }
  }, [googleParams]);

  return (
    <>
      <NavBar onAuth={openAuth} />
      <Routes>
        <Route path="/" element={<LandingPage onAuth={openAuth} />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/connections/map" element={<ConnectionsMap />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={(m) => setAuthMode(m)}
        initialInfo={authInfo}
      />
    </>
  );
}

export default App;
