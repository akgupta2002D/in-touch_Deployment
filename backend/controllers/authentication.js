import pool from "../config/database.js";
import AuthUtils from "../Utils/AuthUtils.js";
import GeneralUtils from "../Utils/GeneralUtils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../Utils/EmailServices.js";
import passport from "passport";
import "../Utils/PassportUtils.js"; // do this since it will initialize the strategies (since we call initializeStrategies there)
import dotenv from "dotenv";

dotenv.config();

const AuthenticationController = {
  verifyAccessToken: async (req, res) => {
    const token = req.body.token;
    const decoded = AuthUtils.verifyAccessToken(token);
    if (decoded) {
      return res.status(200).json({ valid: true, userId: decoded.id });
    } else {
      return res
        .status(401)
        .json({ valid: false, message: "Invalid or expired access token" });
    }
  },

  verifyRefreshToken: async (req, res) => {
    const token = req.body.token;
    const decoded = AuthUtils.verifyRefreshToken(token);
    if (decoded) {
      return res.status(200).json({ valid: true, userId: decoded.id });
    } else {
      return res
        .status(401)
        .json({ valid: false, message: "Invalid or expired refresh token" });
    }
  },
  refreshAccessToken: async (req, res) => {
    // user is provided by verifyRefreshToken middleware
    const user = req.user;
    const tokens = AuthUtils.issueTokens(user);
    AuthUtils.setRefreshTokenCookie(res, tokens.refreshToken);
    res.status(200).json({ accessToken: tokens.accessToken });
  },
  promptGoogle: async (req, res) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false, // false since use jwts as opposed to sessions
    })(req, res);
  },

  handleGoogleCallback: (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
      }
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`); // NOTE : can maybe choose to add /login to frontend url
      }

      // Generate your app's JWTs
      const tokens = AuthUtils.issueTokens(user);

      // Set the Refresh Token in HttpOnly Cookie
      AuthUtils.setRefreshTokenCookie(res, tokens.refreshToken);

      // Determine whether we need username completion
      const redirectBase = process.env.FRONTEND_URL;
      const needsUsername = !user.username;

      // Redirect to frontend with Access Token and needsUsername flag in URL
      // Frontend will parse this and show username box if needed
      const url = `${redirectBase}?token=${encodeURIComponent(
        tokens.accessToken
      )}&needsUsername=${needsUsername ? "true" : "false"}`;
      res.redirect(url);
    })(req, res, next);
  },

  loginWithEmail: async (req, res) => {
    const { email, password } = req.body;
    const user = await GeneralUtils.getUserByEmail(email);
    if (
      user &&
      (await AuthUtils.comparePassword(password, user.password_hash))
    ) {
      const tokens = AuthUtils.issueTokens(user);
      AuthUtils.setRefreshTokenCookie(res, tokens.refreshToken);
      return res.status(200).json({ accessToken: tokens.accessToken });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  },
  signup: async (req, res) => {
    const { username, email, password, display_name } = req.body;

    if (!(await GeneralUtils.uniqueEmail(email))) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (!(await GeneralUtils.uniqueUsername(username))) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const hashedPassword = await AuthUtils.hashPassword(password);

    const { plain_token, hashed_token } =
      await AuthUtils.createEmailVerificationToken();
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      // 3. Insert the user AND the verification data
      // Note: Using PostgreSQL syntax ($1, $2) and RETURNING id
      const result = await pool.query(
        `INSERT INTO users 
            (username, email, password_hash, display_name, email_verification_token, email_verification_token_expires_at) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id`,
        [
          username,
          email,
          hashedPassword,
          display_name,
          hashed_token,
          tokenExpiration,
        ]
      );

      const newUserId = result.rows[0].id;

      // 4. Send the email with the PLAIN token and the USER ID
      await sendVerificationEmail(email, plain_token, newUserId);

      return res.status(201).json({
        message: "User registered successfully. Please check your email.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error registering user" });
    }
  },

  verifyEmail: async (req, res) => {
    // 1. Get both token and id from the query parameters
    const { token, id } = req.query;

    if (!token || !id) {
      return res.status(400).json({ message: "Missing token or user ID" });
    }

    try {
      // 2. Find the user by ID
      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userResult.rows[0];

      // 3. Check if already verified
      if (user.is_email_verified) {
        return res.status(200).json({ message: "Email already verified." });
      }

      if (
        !user.email_verification_token ||
        !user.email_verification_token_expires_at
      ) {
        return res.status(400).json({
          message: "No verification token found. Please request a new one.",
        });
      }

      // 4. Check Expiration (Compare Database time vs Current time)
      const currentTime = new Date();
      const expiresAt = new Date(user.email_verification_token_expires_at);
      if (isNaN(expiresAt.getTime()) || expiresAt < currentTime) {
        return res
          .status(400)
          .json({ message: "Token has expired. Please request a new one." });
      }

      // 5. Verify the Token Hash
      // We compare the PLAIN token from the URL against the HASHED token in the DB
      const isValid = await AuthUtils.comparePassword(
        token,
        user.email_verification_token
      );

      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification token." });
      }

      // 6. Success! Update the user
      await pool.query(
        `UPDATE users 
             SET is_email_verified = true, 
                 email_verification_token = NULL, 
                 email_verification_token_expires_at = NULL 
             WHERE id = $1`,
        [id]
      );

      return res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error during verification." });
    }
  },

  logout: async (req, res) => {
    AuthUtils.clearRefreshTokenCookie(res);
    return res.status(200).json({ message: "Logged out successfully" });
  },

  initiatePasswordReset: async (req, res) => {
    const { email } = req.body;

    // 1. Find User
    const user = await GeneralUtils.getUserByEmail(email);
    if (!user) {
      // Security tip: Don't reveal if email exists.
      // Just say "If that email exists, we sent a link."
      return res
        .status(200)
        .json({ message: "If an account exists, a reset link has been sent." });
    }

    // 2. Generate Token Pair
    const { plain_token, hashed_token } =
      await AuthUtils.createEmailVerificationToken(); // Re-using the same generator is fine

    // 3. Set Expiration (e.g., 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    try {
      // 4. Save Hash and Expiry to DB
      await pool.query(
        `UPDATE users 
             SET password_reset_token = $1, 
                 password_reset_token_expires_at = $2 
             WHERE id = $3`,
        [hashed_token, expiresAt, user.id]
      );

      // 5. Send Email with PLAIN token and ID
      await sendPasswordResetEmail(email, plain_token, user.id);

      return res
        .status(200)
        .json({ message: "If an account exists, a reset link has been sent." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  completePasswordReset: async (req, res) => {
    // Frontend sends { token, id, newPassword }
    const { token, id, newPassword } = req.body;

    if (!token || !id || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      // 1. Get User and Reset Data
      const result = await pool.query(
        "SELECT id, password_reset_token, password_reset_token_expires_at FROM users WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result.rows[0];

      // 2. Check Expiration
      const prtExpiresAt = user.password_reset_token_expires_at
        ? new Date(user.password_reset_token_expires_at)
        : null;
      if (
        !prtExpiresAt ||
        isNaN(prtExpiresAt.getTime()) ||
        prtExpiresAt < new Date()
      ) {
        return res.status(400).json({ message: "Reset link has expired." });
      }

      // 3. Verify Token Hash
      const isValid = await AuthUtils.comparePassword(
        token,
        user.password_reset_token
      );
      if (!isValid) {
        return res.status(400).json({ message: "Invalid reset token." });
      }

      // 4. Hash NEW Password
      const newPasswordHash = await AuthUtils.hashPassword(newPassword);

      // 5. Update Password AND Clear Reset Token
      await pool.query(
        `UPDATE users 
             SET password_hash = $1, 
                 password_reset_token = NULL, 
                 password_reset_token_expires_at = NULL 
             WHERE id = $2`,
        [newPasswordHash, id]
      );

      return res
        .status(200)
        .json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

export default AuthenticationController;
