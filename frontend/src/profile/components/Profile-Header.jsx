// src/components/profile/ProfileHeader.jsx
import React from "react";
import "./ProfileHeader.css";

export default function ProfileHeader({ profile, loading }) {
  const displayName =
    !loading && profile?.display_name
      ? profile.display_name
      : loading
      ? "Loading..."
      : "Unknown User";

  const initials =
    !loading && profile?.display_name
      ? profile.display_name
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0].toUpperCase())
          .join("")
          .slice(0, 2)
      : "IN";

  const subline = !loading && profile?.username ? `@${profile.username}` : "";

  return (
    <section className="profile-header-card">
      <div className="profile-header-avatar-ring">
        <div className="profile-header-avatar">
          <span className="profile-header-initials">{initials}</span>
        </div>
      </div>

      <div className="profile-header-text">
        <h2 className="profile-header-name">{displayName}</h2>
        <p className="profile-header-tagline">{subline || "Member"}</p>
      </div>
    </section>
  );
}
