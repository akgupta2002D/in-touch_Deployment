import React, { useCallback, useEffect, useState } from "react";
import "./ConnectionsMapPage.css";

import ConnectionsMap from "./components/ConnectionsMap";
import ConnectionsMapLine from "./components/ConnectionMapLine";
import ConnectionContactModal from "./components/ConnectionContactModal";

import {
  fetchConnections,
  markReachedOut
} from "../connections/services/ConnectionService";

// THRESHOLDS for “closeness” logic (can be tuned)
const RECENT_DAYS = 14; // <= 14 days → close + green
const STALE_DAYS = 45;  // >= 45 days → far + red

const ConnectionsMapPage = () => {
  // State for connections data, loading/saving status, error, and modal
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [contactModalConnection, setContactModalConnection] = useState(null);

  // Loads connections data from the backend
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConnections();
      setConnections(res || []);
      console.log(res);
    } catch (err) {
      setError(err.message || "Something went wrong loading connections.");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Opens the contact modal for a connection
  const handleNodeClick = (connection) => {
    setContactModalConnection(connection);
  };

  // Closes the contact modal
  const handleContactModalClose = () => {
    setContactModalConnection(null);
  };

  // Marks a connection as contacted and reloads data
  const handleConfirmContacted = async () => {
    if (!contactModalConnection) return;
    setSaving(true);
    setError(null);
    try {
      await markReachedOut(contactModalConnection.connectionId);
      await loadData();
      setContactModalConnection(null);
    } catch (err) {
      setError(err.message || "Failed to update contact status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="connections-map-page app-shell">
      <div className="connections-map-page-inner">
        <h1>Your Connections Map</h1>
        {/* Error display and retry button */}
        {error && (
          <div className="connections-map-error card">
            <div className="connections-map-error-header">Something went wrong</div>
            <div className="connections-map-error-body">{error}</div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => loadData()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main connections map line visualization */}
        <ConnectionsMapLine
          connections={connections}
          loading={loading}
          recentDays={RECENT_DAYS}
          staleDays={STALE_DAYS}
          onNodeClick={handleNodeClick}
        />

        {/* Modal for contacting a connection */}
        {contactModalConnection && (
          <ConnectionContactModal
            connection={contactModalConnection}
            onClose={handleContactModalClose}
            onConfirm={handleConfirmContacted}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionsMapPage;
