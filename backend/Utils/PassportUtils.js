import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "../config/database.js";

dotenv.config();

const PassportUtils = {
    initializeStrategies: () => {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user exists with this Google ID
                const result = await pool.query(
                    'SELECT * FROM users WHERE google_sub_id = $1', 
                    [profile.id]
                );

                if (result.rows.length > 0) {
                    return done(null, result.rows[0]);
                }

                // 2. If not, check if user exists with this email (to prevent duplicates)
                // Note: Google emails are verified, so we can trust them.
                const email = profile.emails[0].value;
                const emailRes = await pool.query(
                    'SELECT * FROM users WHERE email = $1', 
                    [email]
                );

                if (emailRes.rows.length > 0) {
                    // User exists but hasn't linked Google yet. Link it now.
                    const existingUser = emailRes.rows[0];
                    await pool.query(
                        'UPDATE users SET google_sub_id = $1, is_email_verified = true WHERE id = $2',
                        [profile.id, existingUser.id]
                    );
                    existingUser.google_sub_id = profile.id;
                    return done(null, existingUser);
                }

                // 3. Create new user
                // We leave username NULL so you can force them to set it later
                // We set is_email_verified to TRUE because it came from Google
                const displayName = profile.displayName;
                
                const insertRes = await pool.query(
                    `INSERT INTO users 
                     (email, display_name, google_sub_id, is_email_verified, profile_picture_url) 
                     VALUES ($1, $2, $3, true, $4)
                     RETURNING id`,
                    [email, displayName, profile.id, profile.photos[0]?.value || '']
                );

                const newUser = {
                    id: insertRes.rows[0].id,
                    email: email,
                    display_name: displayName,
                    google_sub_id: profile.id,
                    username: null
                };

                return done(null, newUser);

            } catch (error) {
                return done(error, null);
            }
        }));
    }
};

// Initialize strategies immediately when this file is imported
PassportUtils.initializeStrategies();

export default PassportUtils;