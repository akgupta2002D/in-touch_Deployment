import React from "react";
import "./ConnectionHeader.css";

const ConnectionsHeader = ({
  search,
  onSearchChange,
  onAddClick,
  loading,
  saving,
  activeView = "list"
  }) => {
  const handleInputChange = (e) => {
    onSearchChange(e);
  };

  return (
    <header className="connections-header">
      <div className="connections-header-main">
        <div>
          <h1 className="connections-title">Connections</h1>
          <p className="connections-subtitle">
            Prioritized list of who to reach out to next.
          </p>
        </div>

        {/* View toggle: list / map */}
        <div className="connections-view-toggle" aria-label="View mode">
          <a
            href="/connections"
            className={
              "btn btn-switch view-toggle-btn" +
              (activeView === "list" ? " active" : "")
            }
          >
            {/* List icon */}
            <span className="view-toggle-icon" aria-hidden="true">
              <svg
                viewBox="0 0 20 20"
                className="view-toggle-svg"
                focusable="false"
              >
                <rect x="3" y="4" width="14" height="2" rx="1" />
                <rect x="3" y="9" width="14" height="2" rx="1" />
                <rect x="3" y="14" width="14" height="2" rx="1" />
              </svg>
            </span>
            <span className="view-toggle-label">List</span>
          </a>

          <a
            href="/connections/map"
            className={
              "btn btn-switch view-toggle-btn" +
              (activeView === "map" ? " active" : "")
            }
          >
            {/* Map / orbit icon */}
            <span className="view-toggle-icon" aria-hidden="true">
              <svg
                viewBox="0 0 20 20"
                className="view-toggle-svg"
                focusable="false"
              >
                <circle cx="10" cy="10" r="3.2" />
                <circle cx="4.2" cy="10" r="1.4" />
                <circle cx="15.8" cy="10" r="1.4" />
                <ellipse
                  cx="10"
                  cy="10"
                  rx="7"
                  ry="4.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
            <span className="view-toggle-label">Map</span>
          </a>
        </div>
      </div>

      <div className="connections-header-actions">
        <div className="connections-search-wrapper">
          <input
            type="text"
            value={search}
            onChange={handleInputChange}
            placeholder="Search connections..."
            className="connections-search-input"
          />
        </div>

        <button
          type="button"
          className="btn btn-primary connections-add-btn"
          onClick={onAddClick}
        >
          + Add Connection
        </button>
      </div>

      {(loading || saving) && (
        <div className="connections-status-pill">
          {loading ? "Loading connections..." : "Saving changes..."}
        </div>
      )}
    </header>
  );
};

export default ConnectionsHeader;
