// src/components/connections/ConnectionCard.jsx
import React from "react";
import "./ConnectionCard.css";

const formatReachoutLabel = (daysUntilReachout) => {
  if (daysUntilReachout == null) return "Reach out soon";
  if (daysUntilReachout <= 0) return "Reach out now";
  if (daysUntilReachout === 1) return "Reach out in 1 day";
  return `Reach out in ${daysUntilReachout} days`;
};

const formatConnectionType = (connectionType) => {
  if (!connectionType) return "Not set";
  return connectionType.replace("_", " "); // "close_friend" → "close friend"
};

const ConnectionCard = ({
  connection,
  onDelete,
  onReachedOut,
  onOpenDetail,
  onEdit
}) => {
  const isDueNow =
    connection.daysUntilReachout != null &&
    connection.daysUntilReachout <= 0;

  return (
    <article className="connection-card">
      <div className="connection-card-main">
        <div className="connection-card-name-row">
          <div className="connection-card-avatar">
            {connection.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="connection-card-name">{connection.name}</h3>
            <p className="connection-card-title">
              {formatConnectionType(connection.connectionType)}
            </p>
          </div>
        </div>

        <div className="connection-card-meta">
          <span
            className={
              "connection-card-reachout-tag" +
              (isDueNow ? " connection-card-reachout-now" : "")
            }
          >
            {formatReachoutLabel(connection.daysUntilReachout)}
          </span>
          <span className="connection-card-submeta">
            Status: {connection.status}
          </span>
        </div>
      </div>

      <div className="connection-card-actions">
        <button
          type="button"
          className="btn btn-primary connection-card-btn"
          onClick={onReachedOut}
        >
          Reached Out
        </button>
        <button
          type="button"
          className="btn btn-ghost connection-card-btn"
          onClick={onOpenDetail}
        >
          Details
        </button>
        <button
          type="button"
          className="btn btn-ghost connection-card-btn"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-ghost connection-card-btn connection-card-delete"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default ConnectionCard;
