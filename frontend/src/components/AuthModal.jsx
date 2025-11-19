import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chrome,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AtSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { signup as signupApi, login as loginApi } from "../services/auth";

// Password strength checker
const passwordStrength = (pw) => {
  const lengthOk = pw.length >= 8;
  const lowerOk = /[a-z]/.test(pw);
  const upperOk = /[A-Z]/.test(pw);
  const numberOk = /\d/.test(pw);
  const specialOk = /[^A-Za-z0-9]/.test(pw);
  const isStrong = lengthOk && lowerOk && upperOk && numberOk && specialOk;
  return { lengthOk, lowerOk, upperOk, numberOk, specialOk, isStrong };
};

const AuthModal = ({ open, mode, onClose, onSwitchMode, initialInfo }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("credentials"); // 'google' | 'credentials'
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  React.useEffect(() => {
    if (initialInfo) setInfo(initialInfo);
  }, [initialInfo]);

  const updateField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const strength = React.useMemo(
    () => passwordStrength(form.password),
    [form.password]
  );
  const confirmMatches =
    mode === "signup" ? form.confirmPassword === form.password : true;
  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="modal-overlay"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="auth-modal max-h-[85vh] overflow-y-auto" onClick={stop}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="subtitle">
          {mode === "login" ? "Log in to stay in touch with your people." : ""}
        </p>

        {/* Only show tab buttons in login mode */}
        {mode === "login" && (
          <div className="tab-row">
            <button
              className={`btn-switch ${tab === "google" ? "active" : ""}`}
              onClick={() => setTab("google")}
              type="button"
            >
              <Chrome className="h-5 w-5" /> Google
            </button>
            <button
              className={`btn-switch ${tab === "credentials" ? "active" : ""}`}
              onClick={() => setTab("credentials")}
              type="button"
            >
              <Mail className="h-5 w-5" />{" "}
              {mode === "login" ? "Email Login" : "Email Signup"}
            </button>
          </div>
        )}

        {/* Google auth card (used for both login and signup) */}
        {(tab === "google" || mode === "signup") && (
          <div className="card p-5 flex flex-col gap-4 mt-4">
            <p className="text-base text-[var(--color-muted)]">
              Sign up/Log in quickly with your Google account.
            </p>
            <button
              className="btn-primary w-full"
              type="button"
              onClick={() => {
                const base = import.meta?.env?.VITE_BACKEND_URL || "";
                const url = base
                  ? `${base.replace(/\/$/, "")}/api/auth/google`
                  : `/api/auth/google`;
                window.location.href = url;
              }}
            >
              <Chrome className="h-5 w-5 mr-2" />
              {mode === "login"
                ? "Continue with Google"
                : "Sign up with Google"}
            </button>
          </div>
        )}

        {tab === "credentials" && (
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setInfo("");

              if (mode === "signup") {
                // basic client validation
                if (!strength.isStrong) {
                  setError(
                    "Password is not strong enough. Please meet all requirements."
                  );
                  return;
                }
                if (!confirmMatches) {
                  setError("Passwords do not match.");
                  return;
                }
                setSubmitting(true);
                try {
                  const res = await signupApi({
                    username: form.username.trim(),
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                  });
                  setInfo(
                    res?.message ||
                      "If this email belongs to you, a verification link has been sent."
                  );
                  setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                } catch (err) {
                  if (err?.code === "EMAIL_TAKEN") {
                    setError("That email is already registered.");
                  } else if (err?.code === "USERNAME_TAKEN") {
                    setError("That username is already taken.");
                  } else {
                    setError(
                      err?.message || "Signup failed. Please try again."
                    );
                  }
                } finally {
                  setSubmitting(false);
                }
              } else {
                // login flow
                setSubmitting(true);
                try {
                  await loginApi({
                    email: form.email.trim(),
                    password: form.password,
                  });
                  setInfo("Logged in successfully.");
                  // Close modal and redirect to profile page
                  onClose && onClose();
                  navigate("/profile");
                } catch (err) {
                  if (err?.code === "INVALID_CREDENTIALS") {
                    setError("Invalid email or password.");
                  } else if (err?.code === "NETWORK") {
                    setError(
                      "Unable to reach server. Check your connection and try again."
                    );
                  } else if (!err?.response) {
                    setError("Request failed. Please verify your connection.");
                  } else if (err?.code === "UNKNOWN") {
                    setError(err?.message || "Login failed. Please try again.");
                  } else {
                    setError("Login failed. Please try again.");
                  }
                } finally {
                  setSubmitting(false);
                }
              }
            }}
          >
            {mode === "signup" && (
              <>
                <div className="w-full">
                  <label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 w-full">
                    <AtSign className="h-5 w-5 text-[var(--color-muted)]" />
                    <input
                      id="username"
                      className="w-full flex-1"
                      placeholder="your_username"
                      type="text"
                      required
                      value={form.username}
                      onChange={updateField("username")}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 w-full">
                    <User className="h-5 w-5 text-[var(--color-muted)]" />
                    <input
                      id="name"
                      className="w-full flex-1"
                      placeholder="First_Name Last_Name"
                      type="text"
                      required
                      value={form.name}
                      onChange={updateField("name")}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="w-full">
              <label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 w-full">
                <Mail className="h-5 w-5 text-[var(--color-muted)]" />
                <input
                  id="email"
                  className="w-full flex-1"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={updateField("email")}
                />
              </div>
            </div>

            <div className="w-full">
              <label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 w-full">
                <Lock className="h-5 w-5 text-[var(--color-muted)]" />
                <input
                  id="password"
                  className="w-full flex-1"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={updateField("password")}
                />
                <button
                  type="button"
                  className="p-1 text-[var(--color-muted)]"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="w-full">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 w-full">
                  <Lock className="h-5 w-5 text-[var(--color-muted)]" />
                  <input
                    id="confirmPassword"
                    className="w-full flex-1"
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    aria-invalid={form.confirmPassword && !confirmMatches}
                  />
                  <button
                    type="button"
                    className="p-1 text-[var(--color-muted)]"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.confirmPassword && !confirmMatches && (
                  <p className="mt-1 text-sm text-red-500">
                    Passwords do not match.
                  </p>
                )}
              </div>
            )}

            {mode === "signup" ? (
              <div className="mt-2 text-sm">
                <p className="mb-1 text-[var(--color-muted)]">
                  Password must include:
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    {strength.lengthOk ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {strength.lowerOk ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>One lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {strength.upperOk ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>One uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {strength.numberOk ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>One number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {strength.specialOk ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>One special character</span>
                  </li>
                </ul>
                {form.password && strength.isStrong && (
                  <p className="mt-2 text-green-600">Strong password ✔</p>
                )}
              </div>
            ) : (
              <div className="helper-text">
                Fill in your email and password to log in.
              </div>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="mt-2 text-sm text-green-600" role="status">
                {info}
              </p>
            )}

            <button
              className="btn-primary w-full mt-1 disabled:opacity-60"
              type="submit"
              disabled={
                submitting ||
                (mode === "signup"
                  ? !form.username.trim() ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !strength.isStrong ||
                    !confirmMatches
                  : !form.email.trim() || !form.password)
              }
            >
              {submitting
                ? "Submitting..."
                : mode === "login"
                ? "Log In"
                : "Sign Up"}
            </button>
          </form>
        )}

        {/* Switch between login/signup */}
        <div className="switch-auth mt-3">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button type="button" onClick={() => onSwitchMode("signup")}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => onSwitchMode("login")}>
                Log in
              </button>
            </>
          )}
        </div>

        <div className="divider" />
        <p className="text-[12px] text-center text-[var(--color-muted)] px-2">
          By continuing you agree to our Terms & Privacy (placeholder).
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
