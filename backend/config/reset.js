import pool from "./database.js";

const resetDatabase = async () => {
  // TODO: implement database reset logic here
  const removeTablesQuery = `
        DROP TABLE IF EXISTS user_hobbies;
        DROP TABLE IF EXISTS connections;
        DROP TABLE IF EXISTS hobbies;
        DROP TABLE IF EXISTS users;
    `;

  // create users table query string
  const createUsersTableQuery = `
        CREATE TABLE users (
        -- User information
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            username VARCHAR(50) UNIQUE NULL, -- this is null since on Google sign up, store user information before forcing username creation

        -- Time stamps
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMPTZ NULL,

        -- Authentication
            password_hash VARCHAR(255) NULL,
            google_sub_id TEXT UNIQUE NULL,

        -- Email verification
            is_email_verified BOOLEAN DEFAULT FALSE,
            email_verification_token TEXT NULL,
            email_verification_token_expires_at TIMESTAMPTZ NULL,

        -- password reset
            password_reset_token TEXT NULL,
            password_reset_token_expires_at TIMESTAMPTZ NULL,

        -- Optional Information
            profile_picture_url TEXT NOT NULL DEFAULT '',
            bio VARCHAR(500) NOT NULL DEFAULT '',
            personality_type VARCHAR(50) NOT NULL DEFAULT '',
            nearest_city VARCHAR(100) NOT NULL DEFAULT '',
            -- hobbies moved to many-to-many via user_hobbies

        -- Constraints
           CONSTRAINT chk_email_format CHECK (POSITION('@' IN email) > 1) 
        );
    `;

  const createHobbiesTableQuery = `
        CREATE TABLE hobbies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(25) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `;

  const createUserHobbiesTableQuery = `
        CREATE TABLE user_hobbies (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            hobby_id INTEGER NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, hobby_id)
        );
    `;

  const createConnectionsTableQuery = `
        CREATE TABLE connections (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            connection_name VARCHAR(100) NOT NULL,
            last_contacted_at TIMESTAMPTZ NULL,
            reminder_frequency_days INTEGER NOT NULL,
            notes TEXT NULL,
            connection_type VARCHAR(50) NOT NULL DEFAULT 'acquaintance',
            know_from VARCHAR(255) NOT NULL DEFAULT '',
            reach_out_priority INTEGER NOT NULL DEFAULT 0,

            CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT chk_reminder_frequency CHECK (reminder_frequency_days > 0),
            CONSTRAINT chk_reach_out_priority CHECK (reach_out_priority >= 0 AND reach_out_priority <= 10)

        );
    `;

  try {
    const client = await pool.connect();
    await client.query(removeTablesQuery);
    console.log("✅ Dropped existing tables.");
    await client.query(createUsersTableQuery);
    console.log("✅ Created users table.");
    await client.query(createHobbiesTableQuery);
    console.log("✅ Created hobbies table.");
    await client.query(createUserHobbiesTableQuery);
    console.log("✅ Created user_hobbies table.");
    await client.query(createConnectionsTableQuery);
    console.log("✅ Created connections table.");
    client.release();
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
};

resetDatabase();
