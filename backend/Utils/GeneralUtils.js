// import { get } from "http";
import pool from "../config/database.js";

const GeneralUtils = {
    // function to check if an email is valid
    // input: email (string)
    // output: boolean
    uniqueEmail: async (email) => {
        const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        return res.rows.length === 0;
    },

    // function to check if a username is valid
    // input: username (string)
    // output: boolean
    uniqueUsername: async (username) => {
        const res = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        return res.rows.length === 0;
    },

    getUserByEmail: async (email) => {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    },

    getUserById: async (id) => {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    },

    markEmailAsVerified: async (id) => {
        await pool.query('UPDATE users SET is_email_verified = $1 WHERE id = $2', [true, id]);
    }
};

export default GeneralUtils;