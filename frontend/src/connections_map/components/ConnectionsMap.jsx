// src/components/connections/ConnectionsMap.jsx
import React, { useMemo } from "react";
import "./ConnectionsMap.css";

/**
 * Compute ring bucket from daysSinceLastContact:
 * - ring 0 (inner): recently contacted
 * - ring 1 (middle): okay / neutral
 * - ring 2 (outer): stale / red
 */
const getRingIndex = (connection, recentDays, staleDays) => {
  const days = connection.daysSinceLastContact;

  if (days == null) {
    // If unknown, treat as middle.
    return 1;
  }

  if (days <= recentDays) return 0;
  if (days >= staleDays) return 2;
  return 1;
};

const ConnectionsMap = ({
  connections,
  loading,
  recentDays,
  staleDays,
  onNodeClick
    }) => {
        console.log(connections);
  const rings = useMemo(() => {
    const groups = { 0: [], 1: [], 2: [] };

    connections.forEach((c) => {
      const ringIndex = getRingIndex(c, recentDays, staleDays);
      groups[ringIndex].push(c);
    });

    return groups;
  }, [connections, recentDays, staleDays]);

  const hasConnections = connections && connections.length > 0;
  console.log(connections);

  return (
    <section className="connections-map-section">
      <div className="connections-map card">
        <div className="connections-map-orbit">
          {/* Orbit rings as background */}
          <div className="orbit-ring orbit-ring-1" />
          <div className="orbit-ring orbit-ring-2" />
          <div className="orbit-ring orbit-ring-3" />

          {/* Center "You" node */}
          <div className="orbit-center-node">
            <div className="orbit-center-avatar">You</div>
            <div className="orbit-center-label">Your network</div>
          </div>

          {/* Connection nodes */}
          {[0, 1, 2].map((ringIndex) => {
            const bucket = rings[ringIndex];
            if (!bucket || bucket.length === 0) return null;

            const count = bucket.length;
            const radiusFactor = [0.32, 0.48, 0.64][ringIndex]; // relative radius

            return bucket.map((connection, idx) => {
              const angle = (idx / count) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * radiusFactor * 100;
              const y = 50 + Math.sin(angle) * radiusFactor * 100;

              const days = connection.daysSinceLastContact;
              const isRecent =
                days != null && days <= recentDays;
              const isStale =
                days != null && days >= staleDays;

              const classNames = [
                "orbit-node",
                `orbit-node-ring-${ringIndex}`,
                isRecent ? "orbit-node-recent" : "",
                isStale ? "orbit-node-stale" : ""
              ]
                .filter(Boolean)
                .join(" ");

              const handleClick = () => {
                if (onNodeClick) onNodeClick(connection);
              };

              const label =
                connection.name ||
                connection.connectionType ||
                "Connection";

              const initial =
                connection.name?.[0]?.toUpperCase() || "?";

              return (
                <button
                  key={connection.connectionId}
                  type="button"
                  className={classNames}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={handleClick}
                  aria-label={`Connection: ${label}. ${
                    days != null
                      ? `Last contacted ${days} days ago.`
                      : "Last contacted date unknown."
                  }`}
                >
                  <div className="orbit-node-inner">
                    <div className="orbit-node-avatar">
                      {initial}
                    </div>
                  </div>
                  <span className="orbit-node-name" aria-hidden="true">
                    {label}
                  </span>
                </button>
              );
            });
          })}

          {loading && (
            <div className="connections-map-loading">
              Mapping your network...
            </div>
          )}

          {!loading && !hasConnections && (
            <div className="connections-map-empty">
              <h3>No connections to map yet</h3>
              <p>Add a few connections first, then come back to see your orbit.</p>
            </div>
          )}
        </div>
      </div>

      <p className="connections-map-legend">
        <span className="legend-dot legend-dot-green" /> Close (recently
        contacted) &nbsp;·&nbsp;
        <span className="legend-dot legend-dot-red" /> Far (haven’t reached out
        in a while)
      </p>
    </section>
  );
};

export default ConnectionsMap;
