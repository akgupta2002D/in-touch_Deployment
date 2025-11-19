import express from "express";
import rateLimit from "express-rate-limit";
import UsersController from "../controllers/users.js";
import { requireAccessToken } from "../middleware/auth.js";

const UsersRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const UsersRouter = express.Router();

UsersRouter.use(UsersRateLimiter);

// Route to get user profile information (requires authentication)
UsersRouter.get("", requireAccessToken, UsersController.getProfile);

// Route to update user profile information (requires authentication)
UsersRouter.put("", requireAccessToken, UsersController.updateProfile);

// Route to delete user account (requires authentication)
UsersRouter.delete("", requireAccessToken, UsersController.deleteAccount);

export default UsersRouter;
