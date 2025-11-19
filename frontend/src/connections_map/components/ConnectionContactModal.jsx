// src/components/connections/ConnectionContactModal.jsx
import React from "react";
import "./ConnectionContactModal.css";

const ConnectionContactModal = ({ connection, onClose, onConfirm, saving }) => {
  if (!connection) return null;

  return (
    <div className="modal-overlay">
      <div className="connection-contact-modal">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2>Did you reach out to {connection.name}?</h2>
        <p className="connection-contact-subtitle">
          Updating this will move them closer to you on the map and reset their
          reminder.
        </p>

        <div className="connection-contact-body card">
          <div className="connection-contact-name">{connection.name}</div>
          <div className="connection-contact-meta">
            {connection.connectionType && (
              <span>{connection.connectionType.replace("_", " ")}</span>
            )}
            {connection.daysSinceLastContact != null && (
              <span>
                Last contacted {connection.daysSinceLastContact} days ago
              </span>
            )}
          </div>
        </div>

        <div className="connection-contact-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Not yet
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Updating..." : "Yes, I reached out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionContactModal;
