import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, User, Users as UsersIcon, LogOut, Trash2 } from "lucide-react";
import { logout } from "../services/auth";
import { deleteAccount } from "../services/users";
import ConfirmModal from "./ConfirmModal";

export default function NavBar({ onAuth }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return Boolean(window?.localStorage?.getItem("access_token"));
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const onToken = (e) => setIsLoggedIn(Boolean(e?.detail?.token));
    const onStorage = (e) => {
      if (e.key === "access_token") setIsLoggedIn(Boolean(e.newValue));
    };
    window.addEventListener("auth:token", onToken);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:token", onToken);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Also respond to route changes by re-checking token presence
  useEffect(() => {
    try {
      setIsLoggedIn(Boolean(window?.localStorage?.getItem("access_token")));
    } catch {}
  }, [location.pathname]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-6 pt-6">
        <header className="flex items-center gap-16 justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-[var(--color-primary-600)] text-white shadow">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              In Touch
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="btn-ghost flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>View Profile</span>
                </Link>
                <Link
                  to="/connections"
                  className="btn-ghost flex items-center gap-2"
                >
                  <UsersIcon className="h-4 w-4" />
                  <span>Connections</span>
                </Link>
                <button
                  className="btn-ghost flex items-center gap-2"
                  onClick={() => setShowLogout(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
                <button
                  className="btn-ghost flex items-center gap-2 text-red-300 hover:text-red-200"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-ghost"
                  onClick={() => onAuth && onAuth("login")}
                >
                  Log In
                </button>
                <button
                  className="btn-primary"
                  onClick={() => onAuth && onAuth("signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>
      </div>
      <ConfirmModal
        open={showLogout}
        title="Log out?"
        message="Are you sure you want to log out? You'll need to log back in to access your profile and connections."
        confirmText="Log Out"
        cancelText="Cancel"
        busy={loggingOut}
        error={logoutError}
        onCancel={() => {
          if (!loggingOut) setShowLogout(false);
        }}
        onConfirm={async () => {
          setLogoutError("");
          setLoggingOut(true);
          try {
            await logout();
            setShowLogout(false);
            navigate("/");
          } catch (e) {
            setLogoutError(
              e?.message || "Failed to log out. Please try again."
            );
          } finally {
            setLoggingOut(false);
          }
        }}
      />
      <ConfirmModal
        open={showDelete}
        title="Delete account?"
        message="This action is permanent and cannot be undone. All your data will be removed."
        confirmText={deleting ? "Deleting..." : "Yes, delete"}
        cancelText="Cancel"
        busy={deleting}
        error={deleteError}
        onCancel={() => {
          if (!deleting) setShowDelete(false);
        }}
        onConfirm={async () => {
          setDeleteError("");
          setDeleting(true);
          try {
            await deleteAccount();
            // Ensure tokens are cleared (if server didn't) and go home
            await logout();
            setShowDelete(false);
            navigate("/");
          } catch (e) {
            setDeleteError(
              e?.message || "Failed to delete account. Please try again."
            );
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
