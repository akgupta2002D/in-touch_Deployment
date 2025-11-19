// src/components/connections/ConnectionFormModal.jsx
import React, { useEffect, useState } from "react";
import "./ConnectionFormModal.css";

// Valid values (aligned with ERD constraints)
const CONNECTION_TYPES = [
  { value: "", label: "Not set" },
  { value: "close_friend", label: "Close friend" },
  { value: "family_member", label: "Family member" },
  { value: "friend", label: "Friend" },
  { value: "acquaintance", label: "Acquaintance" }
];

const ConnectionFormModal = ({ connection, onClose, onSubmit, saving }) => {
  const isEdit = Boolean(connection);

  const [name, setName] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("");
  // Remove status state
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (connection) {
      setName(connection.name || "");
      setConnectionType(connection.connectionType || "");
      setReminderFrequency(
        connection.reminderFrequency != null
          ? String(connection.reminderFrequency)
          : ""
      );
      // Remove status
      setNotes(connection.notes || "");
    } else {
      setName("");
      setConnectionType("");
      setReminderFrequency("");
      // Remove status
      setNotes("");
    }
  }, [connection]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: name.trim(), // for display, backend may map to UserTo
      connectionType: connectionType || null,
      reminderFrequency:
        reminderFrequency === "" ? null : Number(reminderFrequency),
      status: "connected", // Always set to connected
      notes: notes.trim()
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="connection-form-modal">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2>{isEdit ? "Edit connection" : "Add connection"}</h2>
        <p className="connection-form-subtitle">
          Track how often you want to reach out to this person.
        </p>

        <form className="connection-form" onSubmit={handleSubmit}>
          <div className="connection-form-field">
            <label htmlFor="connection-name">Name</label>
            <input
              id="connection-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="connection-form-field">
            <label htmlFor="connection-type">Connection type</label>
            <select
              id="connection-type"
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
            >
              {CONNECTION_TYPES.map((ct) => (
                <option key={ct.value || "none"} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          <div className="connection-form-field">
            <label htmlFor="connection-reminder">
              Reminder frequency (days)
              <span className="helper">
                How often you’d like to be reminded to reach out.
              </span>
            </label>
            <input
              id="connection-reminder"
              type="number"
              min="0"
              value={reminderFrequency}
              onChange={(e) => setReminderFrequency(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>

          {/* Status field removed */}

          <div className="connection-form-field">
            <label htmlFor="connection-notes">Notes</label>
            <textarea
              id="connection-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, how you met, follow ups..."
              rows={4}
            />
          </div>

          <div className="connection-form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add connection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionFormModal;
