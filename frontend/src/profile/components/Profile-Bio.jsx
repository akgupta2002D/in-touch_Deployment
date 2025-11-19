// src/components/profile/ProfileBio.jsx
import React, { useState } from "react";
import "./ProfileBio.css";
import { PROFILE_LIMITS, applyLimit } from "../../utils/profileLimits";

export default function ProfileBio({
  profile,
  bioValue,
  onEditField,
  loading,
  saving,
  onSave,
}) {
  const [editMode, setEditMode] = useState(false);

  const handleSaveClick = () => {
    if (!profile) return;
    onSave?.();
    setEditMode(false);
  };

  if (loading || !profile) {
    return (
      <section className="profile-bio-card">
        <p className="profile-bio-loading">Loading description…</p>
      </section>
    );
  }

  return (
    <section className="profile-bio-card">
      <div className="profile-bio-header">
        <h3 className="profile-bio-heading">Profile description</h3>
        <button
          type="button"
          className="profile-bio-edit-button"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      {editMode ? (
        <>
          <textarea
            className="profile-bio-textarea"
            rows={4}
            maxLength={PROFILE_LIMITS.bio}
            value={bioValue}
            onChange={(e) =>
              onEditField?.(
                "bio",
                applyLimit(e.target.value, PROFILE_LIMITS.bio)
              )
            }
          />
          <div className="profile-bio-loading" style={{ textAlign: "right" }}>
            {(bioValue || "").length}/{PROFILE_LIMITS.bio}
          </div>
          <div className="profile-bio-actions">
            <button
              type="button"
              className="profile-bio-save-button"
              onClick={handleSaveClick}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      ) : (
        <p className="profile-bio-text">{profile.bio}</p>
      )}
    </section>
  );
}
