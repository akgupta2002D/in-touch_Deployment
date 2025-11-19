import MOCK_CONNECTIONS  from "./mockData";

const MOCK = true; // toggle to false to hit real backend

let mockStore = [...MOCK_CONNECTIONS];


const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

/**
 * Fetch paginated, priority-ordered connections for the current user.
 * Back end should:
 *  - Filter by UserFrom = current user
 *  - Join UserTo to get display name
 *  - Sort by “priority in reaching out”
 */
export async function fetchConnections() {
  if (MOCK) {
    return mockDelay([...mockStore]);
  }

  const res = await fetch("/api/connections", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    throw new Error("Failed to load connections");
  }

  return res.json();
}

/**
 * Add a connection.
 * The backend should:
 *  - Use the authenticated user as UserFrom
 *  - Resolve UserTo via a user lookup or other logic
 *  - Insert into Connections table, respecting constraints
 */
export async function addConnection(payload) {
  if (MOCK) {
    const newConnection = {
      connectionId: Date.now(),
      userId: payload.userId ?? Math.floor(Math.random() * 100000),
      name: payload.name || "New Connection",
      status: payload.status || "connected",
      connectionType: payload.connectionType || null,
      reminderFrequency: payload.reminderFrequency ?? null,
      notes: payload.notes || "",
      daysUntilReachout: payload.initialDaysUntilReachout ?? 0,
      createdAt: new Date().toISOString()
    };
    mockStore = [newConnection, ...mockStore];
    return mockDelay(newConnection);
  }

  // POST /api/connections
  // Body: { name?, userId?, connectionType?, reminderFrequency?, notes?, status? }
  const res = await fetch("/api/connections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Failed to add connection");
  }

  return res.json();
}

/**
 * Update connection metadata: connectionType, reminderFrequency, notes, status.
 */
export async function updateConnection(connectionId, payload) {
  if (MOCK) {
    mockStore = mockStore.map((c) =>
      c.connectionId === connectionId ? { ...c, ...payload } : c
    );
    const updated = mockStore.find((c) => c.connectionId === connectionId);
    return mockDelay(updated);
  }

  // PUT /api/connections/:id
  const res = await fetch(`/api/connections/${connectionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Failed to update connection");
  }

  return res.json();
}

/**
 * Delete a connection.
 * Backend: DELETE FROM Connections WHERE ConnectionID = :id AND UserFrom = currentUser
 */
export async function deleteConnection(connectionId) {
  if (MOCK) {
    mockStore = mockStore.filter((c) => c.connectionId !== connectionId);
    return mockDelay({ success: true });
  }

  // DELETE /api/connections/:id
  const res = await fetch(`/api/connections/${connectionId}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    throw new Error("Failed to delete connection");
  }

  return res.json();
}

/**
 * Mark that user reached out.
 * Backend responsibilities:
 *  - Update timestamp or separate "lastContacted" field/table
 *  - Recompute next reminder (and thus daysUntilReachout)
 */
export async function markReachedOut(connectionId) {
  if (MOCK) {
    mockStore = mockStore.map((c) =>
      c.connectionId === connectionId
        ? {
            ...c,
            // Simple mock behavior: push next reminder by reminderFrequency
            daysUntilReachout: c.reminderFrequency ?? 30,
            // Optionally you could track a lastContactedAt field on the view
          }
        : c
    );
    const updated = mockStore.find((c) => c.connectionId === connectionId);
    return mockDelay(updated);
  }

  // POST /api/connections/:id/reached-out
  const res = await fetch(`/api/connections/${connectionId}/reached-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    throw new Error("Failed to mark reached out");
  }

  return res.json();
}
