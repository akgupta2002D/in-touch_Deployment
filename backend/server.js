import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import passport from "passport";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import UsersRouter from "./routers/users.js";
import AuthenticationRouter from "./routers/authentication.js";
import ConnectionsRouter from "./routers/connections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

// CSRF protection using cookie-based tokens
// The csurf middleware will set a cookie secret and expect the token in the header 'x-csrf-token'
app.use(
  csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  })
);

// Expose a lightweight endpoint for clients to fetch the CSRF token
app.get("/api/auth/csrf-token", (req, res) => {
  // Send token in body; clients should echo it back in 'x-csrf-token'
  res.status(200).json({ csrfToken: req.csrfToken() });
});

app.use("/api/users", UsersRouter);
app.use("/api/auth", AuthenticationRouter);
app.use("/api/connections", ConnectionsRouter);

// Generic error handler for CSRF token errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }
  return res.status(500).json({ message: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
