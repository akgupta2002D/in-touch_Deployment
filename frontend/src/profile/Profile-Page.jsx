// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "../services/users";

import ProfileBio from "./components/Profile-Bio";
import ProfileDetails from "./components/Profile-Details";
import ProfileHeader from "./components/Profile-Header";
import ErrorBox from "../components/ErrorBox";
import { useNavigate } from "react-router-dom";

import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Centralized, frontend-only draft for editable fields
  const [profileDraft, setProfileDraft] = useState(null);

  async function loadProfile() {
    setLoading(true);
    setError("");
    // Fast-fail if no access token present to avoid hanging on refresh attempts
    try {
      const hasToken = Boolean(window?.localStorage?.getItem("access_token"));
      if (!hasToken) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }
    } catch {}
    try {
      const user = await getCurrentUser();
      setProfile(user);
      setProfileDraft({
        display_name: user?.display_name || "",
        username: user?.username || "",
        bio: user?.bio || "",
        personality_type: user?.personality_type || "",
        nearest_city: user?.nearest_city || "",
        hobbies: Array.isArray(user?.hobbies) ? user.hobbies : [],
        profile_picture_url: user?.profile_picture_url || "",
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("You must be logged in to view this page.");
      } else {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Could not load profile"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // Single update method for any profile changes
  const handleUpdateProfile = async (patch) => {
    if (!patch || Object.keys(patch).length === 0) return;
    try {
      setSaving(true);
      const updated = await updateCurrentUser(patch);
      setProfile(updated);
      setProfileDraft({
        display_name: updated?.display_name || "",
        username: updated?.username || "",
        bio: updated?.bio || "",
        personality_type: updated?.personality_type || "",
        nearest_city: updated?.nearest_city || "",
        hobbies: Array.isArray(updated?.hobbies) ? updated.hobbies : [],
        profile_picture_url: updated?.profile_picture_url || "",
      });
    } catch (err) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  // Field editor to mutate centralized draft state
  const editProfileField = (field, value) => {
    setProfileDraft((prev) => ({ ...(prev || {}), [field]: value }));
  };

  // Save helpers for child components
  const saveDetailsFromDraft = () => {
    if (!profileDraft) return;
    const patch = {
      display_name: profileDraft.display_name,
      username: profileDraft.username,
      personality_type: profileDraft.personality_type,
      nearest_city: profileDraft.nearest_city,
      hobbies: profileDraft.hobbies,
    };
    return handleUpdateProfile(patch);
  };

  const saveBioFromDraft = () => {
    if (!profileDraft) return;
    return handleUpdateProfile({ bio: profileDraft.bio });
  };

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <h1 className="profile-page-title">Profile</h1>
        <p className="profile-page-subtitle">
          View all your profile details here.
        </p>
      </header>

      {error && (
        <ErrorBox
          title="Unable to load profile"
          message={error}
          onHome={() => navigate("/")}
        />
      )}

      {!error && (
        <>
          <div className="profile-page-grid">
            <ProfileHeader profile={profile} loading={loading} />
            <ProfileDetails
              profile={profile}
              draft={profileDraft}
              loading={loading}
              saving={saving}
              onEditField={editProfileField}
              onSave={saveDetailsFromDraft}
            />
          </div>

          <ProfileBio
            profile={profile}
            bioValue={profileDraft?.bio || ""}
            onEditField={editProfileField}
            loading={loading}
            saving={saving}
            onSave={saveBioFromDraft}
          />
        </>
      )}
    </div>
  );
}
