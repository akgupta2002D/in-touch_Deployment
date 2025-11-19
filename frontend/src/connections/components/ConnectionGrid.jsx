// src/components/connections/ConnectionsGrid.jsx
import React from "react";
import "./ConnectionGrid.css";
import ConnectionCard from "./ConnectionCard";

const ConnectionsGrid = ({
  connections,
  loading,
  onDelete,
  onReachedOut,
  onOpenDetail,
  onEdit
}) => {
  const showEmpty = !loading && connections.length === 0;

  return (
    <section className="connections-grid-section">
      <div className="connections-grid card">
        {loading && (
          <div className="connections-grid-loading">
            <div className="connections-skeleton-row" />
            <div className="connections-skeleton-row" />
            <div className="connections-skeleton-row" />
          </div>
        )}

        {showEmpty && (
          <div className="connections-empty">
            <h3>No connections yet</h3>
            <p>
              Add a connection to start tracking who to reach out to next.
            </p>
          </div>
        )}

        {!loading && connections.length > 0 && (
          <div className="connections-grid-inner">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.connectionId}
                connection={connection}
                onDelete={() => onDelete(connection)}
                onReachedOut={() => onReachedOut(connection)}
                onOpenDetail={() => onOpenDetail(connection)}
                onEdit={() => onEdit(connection)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConnectionsGrid;
