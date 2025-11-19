// src/components/connections/ConnectionDetailModal.jsx
import React from "react";
import "./ConnectionDetailModal.css";

const ConnectionDetailModal = ({ connection, onClose }) => {
  if (!connection) return null;

  return (
    <div className="modal-overlay">
      <div className="connection-detail-modal">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2>{connection.name}</h2>
        <p className="connection-detail-subtitle">
          {connection.connectionType
            ? connection.connectionType.replace("_", " ")
            : "Connection"}
        </p>

        <div className="connection-detail-grid">
          <div className="connection-detail-item">
            <span className="label">Status</span>
            <span className="value">{connection.status}</span>
          </div>

          <div className="connection-detail-item">
            <span className="label">Reminder frequency</span>
            <span className="value">
              {connection.reminderFrequency != null
                ? `${connection.reminderFrequency} days`
                : "Not set"}
            </span>
          </div>

          <div className="connection-detail-item">
            <span className="label">Reachout in</span>
            <span className="value">
              {connection.daysUntilReachout != null
                ? `${connection.daysUntilReachout} days`
                : "Not computed"}
            </span>
          </div>

          {connection.createdAt && (
            <div className="connection-detail-item">
              <span className="label">Created</span>
              <span className="value">
                {new Date(connection.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {connection.notes && (
          <div className="connection-detail-notes card">
            <div className="label">Notes</div>
            <div className="value">{connection.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionDetailModal;
