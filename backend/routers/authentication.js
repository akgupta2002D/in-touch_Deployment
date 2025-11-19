import express from "express";
import rateLimit from "express-rate-limit";
import AuthenticationController from "../controllers/authentication.js";
import { verifyRefreshToken } from "../middleware/auth.js";

const AuthenticationRouter = express.Router();

// Rate limiter for sensitive authentication endpoints
const verifyTokenRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Login attempts limiter
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup limiter to deter abuse
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset limiter
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// OAuth endpoints limiter
const oauthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
// Route for verifying access token
AuthenticationRouter.post(
  "/verify-token",
  verifyTokenRateLimiter,
  AuthenticationController.verifyAccessToken
);

// Route for verifying refresh token
AuthenticationRouter.post(
  "/verify-refresh-token",
  verifyTokenRateLimiter,
  AuthenticationController.verifyRefreshToken
);

// Route to issue new access token using refresh token (from cookie)
AuthenticationRouter.post(
  "/token/refresh",
  verifyTokenRateLimiter,
  verifyRefreshToken,
  AuthenticationController.refreshAccessToken
);

// Route for user login with email and password
AuthenticationRouter.post(
  "/login",
  loginLimiter,
  AuthenticationController.loginWithEmail
);

// Route for user signup with email and password
AuthenticationRouter.post(
  "/signup",
  signupLimiter,
  AuthenticationController.signup
);

// Google OAuth routes :
// Route triggered when user clicks login/signup with Google
AuthenticationRouter.get(
  "/google",
  oauthLimiter,
  AuthenticationController.promptGoogle
);

// Route for handling Google OAuth callback
AuthenticationRouter.get(
  "/google/callback",
  oauthLimiter,
  AuthenticationController.handleGoogleCallback
);

// Route for user logout
AuthenticationRouter.post("/logout", AuthenticationController.logout);

// Route for verifying user email
AuthenticationRouter.get("/verify-email", verifyEmailLimiter, AuthenticationController.verifyEmail);

// Route for initiating password reset
AuthenticationRouter.post(
  "/reset-password",
  resetLimiter,
  AuthenticationController.initiatePasswordReset
);

// Route for completing password reset
AuthenticationRouter.post(
  "/reset-password/complete",
  resetLimiter,
  AuthenticationController.completePasswordReset
);

export default AuthenticationRouter;
