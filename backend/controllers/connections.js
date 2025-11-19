import pool from "../config/database.js";

const ConnectionsController = {
  // get connections for a user with pagination
  getConnections: async (req, res) => {
    const userId = req.userId;
    const page = Math.max(parseInt(req.params.page, 10) || 1, 1);
    const pageSize = 50;
    const limit = pageSize + 1; // fetch one extra to detect next page
    const offset = (page - 1) * pageSize;

    try {
      const query = `
        SELECT id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at
        FROM connections
        WHERE user_id = $1
        ORDER BY 
          (reach_out_priority * 0.5) + 
          (0.5 * (EXTRACT(EPOCH FROM (NOW() - COALESCE(last_contacted_at, created_at)))/86400 - reminder_frequency_days)) DESC,
          connection_name ASC
        LIMIT $2 OFFSET $3
      `;
      const { rows } = await pool.query(query, [userId, limit, offset]);
      const hasNext = rows.length > pageSize;
      const connections = hasNext ? rows.slice(0, pageSize) : rows;
      return res.status(200).json({ connections, page, hasNext });
    } catch (err) {
      console.error("Error fetching connections:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // create a new connection for the authenticated user
  createConnection: async (req, res) => {
    const userId = req.userId;
    const {
      connection_name,
      reach_out_priority,
      reminder_frequency_days,
      notes,
      connection_type,
      know_from,
    } = req.body || {};

    // Basic validation (align with DB constraints)
    if (
      !connection_name ||
      typeof connection_name !== "string" ||
      connection_name.length > 100
    ) {
      return res
        .status(400)
        .json({ error: "Invalid connection_name (required, max 100 chars)" });
    }
    const freq = parseInt(reminder_frequency_days, 10);
    if (!Number.isInteger(freq) || freq <= 0) {
      return res.status(400).json({
        error: "Invalid reminder_frequency_days (must be integer > 0)",
      });
    }
    const priority = parseInt(reach_out_priority ?? 0, 10);
    if (!Number.isInteger(priority) || priority < 0 || priority > 10) {
      return res
        .status(400)
        .json({ error: "Invalid reach_out_priority (0..10)" });
    }
    if (typeof connection_type !== "string" || connection_type.length > 50) {
      return res
        .status(400)
        .json({ error: "Invalid connection_type (max 50 chars)" });
    }
    if (typeof know_from !== "string" || know_from.length > 255) {
      return res
        .status(400)
        .json({ error: "Invalid know_from (max 255 chars)" });
    }

    try {
      const query = `
        INSERT INTO connections (
          user_id, connection_name, reminder_frequency_days, notes, connection_type, know_from, reach_out_priority
        )
        VALUES ($1, $2, $3, COALESCE($4, ''), COALESCE($5, 'acquaintance'), COALESCE($6, ''), COALESCE($7, 0))
        RETURNING id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at
      `;
      const { rows } = await pool.query(query, [
        userId,
        connection_name,
        freq,
        notes ?? null,
        connection_type ?? null,
        know_from ?? null,
        isNaN(priority) ? 0 : priority,
      ]);
      return res.status(201).json({ connection: rows[0] });
    } catch (err) {
      console.error("Error creating connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // update an existing connection for the authenticated user
  updateConnection: async (req, res) => {
    const userId = req.userId;
    const connectionId = parseInt(req.params.connectionId, 10);
    const {
      connection_name,
      reach_out_priority,
      reminder_frequency_days,
      notes,
      connection_type,
      know_from,
    } = req.body || {};

    // Optional validation if provided
    if (
      connection_name &&
      (typeof connection_name !== "string" || connection_name.length > 100)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid connection_name (max 100 chars)" });
    }
    if (reminder_frequency_days !== undefined) {
      const freq = parseInt(reminder_frequency_days, 10);
      if (!Number.isInteger(freq) || freq <= 0) {
        return res.status(400).json({
          error: "Invalid reminder_frequency_days (must be integer > 0)",
        });
      }
    }
    if (reach_out_priority !== undefined) {
      const priority = parseInt(reach_out_priority, 10);
      if (!Number.isInteger(priority) || priority < 0 || priority > 10) {
        return res
          .status(400)
          .json({ error: "Invalid reach_out_priority (0..10)" });
      }
    }
    if (
      connection_type &&
      (typeof connection_type !== "string" || connection_type.length > 50)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid connection_type (max 50 chars)" });
    }
    if (
      know_from &&
      (typeof know_from !== "string" || know_from.length > 255)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid know_from (max 255 chars)" });
    }

    try {
      const query = `
        UPDATE connections
        SET 
          connection_name = COALESCE($1, connection_name),
          reach_out_priority = COALESCE($2, reach_out_priority),
          reminder_frequency_days = COALESCE($3, reminder_frequency_days),
          notes = COALESCE($4, notes),
          connection_type = COALESCE($5, connection_type),
          know_from = COALESCE($6, know_from)
        WHERE id = $7 AND user_id = $8
        RETURNING id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at
      `;
      const { rows } = await pool.query(query, [
        connection_name ?? null,
        reach_out_priority ?? null,
        reminder_frequency_days ?? null,
        notes ?? null,
        connection_type ?? null,
        know_from ?? null,
        connectionId,
        userId,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Connection not found" });
      }
      return res.status(200).json({ connection: rows[0] });
    } catch (err) {
      console.error("Error updating connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // delete a connection for the authenticated user
  deleteConnection: async (req, res) => {
    const userId = req.userId;
    const connectionId = parseInt(req.params.connectionId, 10);

    try {
      const query = `
        DELETE FROM connections
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;
      const { rows } = await pool.query(query, [connectionId, userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Connection not found" });
      }
      return res.status(204).send();
    } catch (err) {
      console.error("Error deleting connection:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // get details for a specific connection
  getConnectionDetails: async (req, res) => {
    const userId = req.userId;
    const connectionId = parseInt(req.params.connectionId, 10);

    try {
      const query = `
        SELECT *
        FROM connections
        WHERE id = $1 AND user_id = $2
      `;
      const { rows } = await pool.query(query, [connectionId, userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Connection not found" });
      }
      return res.status(200).json({ connection: rows[0] });
    } catch (err) {
      console.error("Error fetching connection details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  searchConnections: async (req, res) => {
    const userId = req.userId;
    const queryParam = req.params.query;
    const limit = 50;

    try {
      const query = `
        SELECT id, connection_name, reach_out_priority, reminder_frequency_days, created_at, last_contacted_at
        FROM connections
        WHERE user_id = $1 AND connection_name ILIKE $2
        ORDER BY 
          (reach_out_priority * 0.5) + 
          (0.5 * (EXTRACT(EPOCH FROM (NOW() - COALESCE(last_contacted_at, created_at)))/86400 - reminder_frequency_days)) DESC,
          connection_name ASC
        LIMIT $3
      `;
      const { rows } = await pool.query(query, [
        userId,
        `%${queryParam}%`,
        limit,
      ]);
      return res.status(200).json({ connections: rows });
    } catch (err) {
      console.error("Error searching connections:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default ConnectionsController;
