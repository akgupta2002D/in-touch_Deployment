import pool from "../config/database.js";

const UsersController = {
  //get profile information for the authenticated user
  getProfile: async (req, res) => {
    const userId = req.userId;

    try {
      const userQuery = `
                SELECT id, email, display_name, username, created_at, last_login_at, profile_picture_url, bio, personality_type, nearest_city
                FROM users
                WHERE id = $1
            `;
      const { rows } = await pool.query(userQuery, [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const user = rows[0];
      // Load hobbies as array of strings
      const hobbiesQuery = `
        SELECT h.name
        FROM user_hobbies uh
        JOIN hobbies h ON h.id = uh.hobby_id
        WHERE uh.user_id = $1
        ORDER BY h.name ASC
      `;
      const { rows: hobbyRows } = await pool.query(hobbiesQuery, [userId]);
      return res
        .status(200)
        .json({ user: { ...user, hobbies: hobbyRows.map((r) => r.name) } });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //update profile information for the authenticated user (partial update)
  updateProfile: async (req, res) => {
    const userId = req.userId;
    const allowed = [
      "username",
      "display_name",
      "profile_picture_url",
      "bio",
      "personality_type",
      "nearest_city",
      // hobbies handled separately as array
    ];
    try {
      const entries = Object.entries(req.body || {}).filter(([k, v]) =>
        allowed.includes(k)
      );

      // If nothing to update, return current profile
      if (entries.length === 0) {
        const { rows } = await pool.query(
          `SELECT id, email, display_name, username, created_at, last_login_at, profile_picture_url, bio, personality_type, nearest_city, hobbies
                     FROM users WHERE id = $1`,
          [userId]
        );
        if (rows.length === 0)
          return res.status(404).json({ error: "User not found" });
        return res.status(200).json({ user: rows[0] });
      }

      // Basic length validations aligned to schema
      const obj = Object.fromEntries(entries);
      if (obj.display_name && obj.display_name.length > 100) {
        return res
          .status(400)
          .json({ error: "display_name too long (max 100)" });
      }
      if (obj.username && obj.username.length > 50) {
        return res.status(400).json({ error: "username too long (max 50)" });
      }
      if (obj.bio && obj.bio.length > 500) {
        return res.status(400).json({ error: "bio too long (max 500)" });
      }
      if (obj.personality_type && obj.personality_type.length > 50) {
        return res
          .status(400)
          .json({ error: "personality_type too long (max 50)" });
      }
      if (obj.nearest_city && obj.nearest_city.length > 100) {
        return res
          .status(400)
          .json({ error: "nearest_city too long (max 100)" });
      }
      // Validate hobbies array if provided in body
      const hobbies = req.body?.hobbies;
      if (hobbies !== undefined) {
        if (!Array.isArray(hobbies)) {
          return res
            .status(400)
            .json({ error: "hobbies must be an array of strings" });
        }
        const sanitized = hobbies
          .map((h) => (typeof h === "string" ? h.trim() : ""))
          .filter((h) => h.length > 0);
        if (sanitized.length > 4) {
          return res
            .status(400)
            .json({ error: "You can provide at most 4 hobbies" });
        }
        for (const h of sanitized) {
          if (h.length > 25) {
            return res
              .status(400)
              .json({ error: "Each hobby must be at most 25 characters" });
          }
        }
        // Replace with sanitized for later use
        req.body.hobbies = sanitized;
      }

      // Build dynamic SET clause only for provided fields
      const setClauses = entries.map(([k], i) => `${k} = $${i + 1}`);
      const values = entries.map(([, v]) => v);
      const query = `
                UPDATE users
                SET ${setClauses.join(", ")}
                WHERE id = $${values.length + 1}
                RETURNING id, email, username, display_name, profile_picture_url, bio, personality_type, nearest_city, created_at
            `;
      const { rows } = await pool.query(query, [...values, userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const updatedUser = rows[0];

      // If hobbies provided, upsert them and reset mapping
      if (req.body?.hobbies !== undefined) {
        const hobbies = req.body.hobbies; // already sanitized
        // Within a transaction: clear existing, ensure hobby ids, insert new mapping
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query("DELETE FROM user_hobbies WHERE user_id = $1", [
            userId,
          ]);
          // Insert or get ids for each hobby name
          const hobbyIds = [];
          for (const name of hobbies) {
            const { rows: hrows } = await client.query(
              `INSERT INTO hobbies (name) VALUES ($1)
               ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
               RETURNING id`,
              [name]
            );
            hobbyIds.push(hrows[0].id);
          }
          for (const hid of hobbyIds) {
            await client.query(
              `INSERT INTO user_hobbies (user_id, hobby_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [userId, hid]
            );
          }
          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          console.error("Error updating hobbies:", e);
          return res.status(500).json({ error: "Failed to update hobbies" });
        } finally {
          client.release();
        }
      }

      // Return with hobbies array
      const { rows: hobbyRows } = await pool.query(
        `SELECT h.name FROM user_hobbies uh JOIN hobbies h ON h.id = uh.hobby_id WHERE uh.user_id = $1 ORDER BY h.name ASC`,
        [userId]
      );
      return res
        .status(200)
        .json({
          user: { ...updatedUser, hobbies: hobbyRows.map((r) => r.name) },
        });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({ error: "Username already in use" });
      }
      console.error("Error updating user profile:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //delete the authenticated user's account
  deleteAccount: async (req, res) => {
    const userId = req.userId;

    try {
      const query = `
                DELETE FROM users
                WHERE id = $1
                RETURNING id
            `;
      const { rows } = await pool.query(query, [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(204).send();
    } catch (err) {
      console.error("Error deleting user account:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default UsersController;
