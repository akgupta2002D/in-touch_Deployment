// src/components/connections/ConnectionsMap.jsx
import React, { useMemo } from "react";
import "./ConnectionMapLine.css";

/**
 * Map daysSinceLastContact to a radial distance.
 * - 0 days  → near the center
 * - MAX_DAYS or more → capped at max radius
 */
const MAX_DAYS = 90; // anything above this is treated as "max distance"
const MIN_RADIUS_PCT = 20; // nearest possible distance from center (percent of container)
const MAX_RADIUS_PCT = 42; // farthest possible distance from center

const getRadiusPctFromDays = (days) => {
  if (days == null) {
    // unknown → middle distance
    return (MIN_RADIUS_PCT + MAX_RADIUS_PCT) / 2;
  }

  const clamped = Math.max(0, Math.min(days, MAX_DAYS));
  const t = clamped / MAX_DAYS; // 0 → 1
  return MIN_RADIUS_PCT + t * (MAX_RADIUS_PCT - MIN_RADIUS_PCT);
};

const ConnectionsMapLine = ({
  connections,
  loading,
  recentDays,
  staleDays,
  onNodeClick
}) => {
  const processed = useMemo(() => {
    const count = Math.max(connections.length, 1);

    return connections.map((c, idx) => {
      const angle = (idx / count) * Math.PI * 2; // even spacing around 360°
        // Calculate days since lastReachedOut (if available)
        let days = null;
        if (c.lastReachedOut) {
        const lastDate = new Date(c.lastReachedOut);
        const today = new Date();
        // Zero out time for accurate day diff
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffMs = today - lastDate;
        days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        console.log(`Connection ${c.name} last contacted ${days} days ago.`);
        console.log(lastDate,today);
        }
        
      const radiusPct = getRadiusPctFromDays(days);

      // Position in percentage space (center at 50%,50%)
      const x = 50 + Math.cos(angle) * radiusPct;
      const y = 50 + Math.sin(angle) * radiusPct;

      return {
        connection: c,
        angle,
        days,
        radiusPct,
        x,
        y
      };
    });
  }, [connections]);

  const hasConnections = connections && connections.length > 0;

  return (
    <section className="connections-map-section">
      <div className="connections-map card">
        <div className="connections-map-orbit">
          {/* Center "You" node */}
          <div className="map-center-node">
            <div className="map-center-avatar">You</div>
            <div className="map-center-label">Your network</div>
          </div>

          {/* Lines & nodes */}
          {processed.map(({ connection, angle, days, radiusPct, x, y }) => {
            const isRecent = days != null && days <= recentDays;
            const isStale = days != null && days >= staleDays;

            const nodeClassNames = [
              "map-node",
              isRecent ? "map-node-recent" : "",
              isStale ? "map-node-stale" : ""
            ]
              .filter(Boolean)
              .join(" ");

            const lineClassNames = [
              "map-line",
              isRecent ? "map-line-recent" : "",
              isStale ? "map-line-stale" : ""
            ]
              .filter(Boolean)
              .join(" ");

            const handleClick = () => {
              if (onNodeClick) onNodeClick(connection);
            };

            const label =
              connection.name || connection.connectionType || "Connection";

            const initial =
              connection.name?.[0]?.toUpperCase() || "?";

            return (
              <React.Fragment key={connection.connectionId}>
                {/* Line from center → node */}
                <div
                  className={lineClassNames}
                  style={{
                    // line starts at center (50%, 50%) and extends outward
                    left: "50%",
                    top: "50%",
                    width: `${radiusPct}%`,
                    transform: `rotate(${angle}rad) translateY(-50%)`,
                    transformOrigin: "0 50%"
                  }}
                  aria-hidden="true"
                />

                {/* Node at end of line */}
                <button
                  type="button"
                  className={nodeClassNames}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={handleClick}
                  aria-label={`Connection: ${label}. ${
                    days != null
                      ? `Last contacted ${days} days ago.`
                      : "Last contacted date unknown."
                  }`}
                >
                  <div className="map-node-inner">
                    <div className="map-node-avatar">{initial}</div>
                  </div>
                  <span className="map-node-name" aria-hidden="true">
                    {label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}

          {loading && (
            <div className="connections-map-loading">
              Mapping your network...
            </div>
          )}

          {!loading && !hasConnections && (
            <div className="connections-map-empty">
              <h3>No connections to map yet</h3>
              <p>Add a few connections first, then come back to see your map.</p>
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

export default ConnectionsMapLine;
