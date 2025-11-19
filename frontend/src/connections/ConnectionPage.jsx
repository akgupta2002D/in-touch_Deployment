import React, { useEffect, useState } from "react";
import "./ConnectionPage.css";
import {
  fetchConnections,
  addConnection,
  updateConnection,
  deleteConnection,
  markReachedOut
} from "./services/ConnectionService";

import ConnectionsHeader from "./components/ConnectionHeader";
import ConnectionsGrid from "./components/ConnectionGrid";
import ConnectionDetailModal from "./components/ConnectionDetailModal";
import ConnectionFormModal from "./components/ConnectionFormModal";

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [detailConnection, setDetailConnection] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  

  // Move loadData outside useEffect so it can be reused
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConnections();
      setConnections(res || []);
    } catch (err) {
      setError(err.message || "Something went wrong loading connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleAddClick = () => {
    setEditingConnection(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (connection) => {
    setEditingConnection(connection);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingConnection(null);
  };

  const handleFormSubmit = async (data) => {
    setSaving(true);
    setError(null);
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.connectionId, data);
      } else {
        await addConnection(data);
      }
      await loadData();
      handleFormClose();
    } catch (err) {
      setError(err.message || "Failed to save connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (connection) => {
    if (!window.confirm(`Delete connection "${connection.name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteConnection(connection.connectionId);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleReachedOut = async (connection) => {
    setSaving(true);
    setError(null);
    try {
      await markReachedOut(connection.connectionId);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to mark as reached out.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = (connection) => {
    setDetailConnection(connection);
  };

  const handleCloseDetail = () => {
    setDetailConnection(null);
  };

  // Filter connections based on search (case-insensitive, on name and email)
  const filteredConnections = connections.filter((c) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="connections-page">
      <div className="connections-page-inner">
        <ConnectionsHeader
          search={search}
          onSearchChange={handleSearchChange}
          onAddClick={handleAddClick}
          loading={loading}
          saving={saving}
        />

        {error && (
          <div className="connections-error card">
            <div className="connections-error-header">Something went wrong</div>
            <div className="connections-error-body">{error}</div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => loadData()}
            >
              Retry
            </button>
          </div>
        )}

        <ConnectionsGrid
          connections={filteredConnections}
          loading={loading}
          onDelete={handleDelete}
          onReachedOut={handleReachedOut}
          onOpenDetail={handleOpenDetail}
          onEdit={handleEditClick}
        />

        {detailConnection && (
          <ConnectionDetailModal
            connection={detailConnection}
            onClose={handleCloseDetail}
          />
        )}

        {isFormOpen && (
          <ConnectionFormModal
            connection={editingConnection}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;
