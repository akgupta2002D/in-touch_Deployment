import AuthUtils from "../Utils/AuthUtils.js";
import GeneralUtils from "../Utils/GeneralUtils.js";

// Middleware to require a valid JWT access token from Authorization header
export const requireAccessToken = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  const decoded = AuthUtils.verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  req.userId = decoded.id;
  next();
};

// Middleware to verify refresh token from HttpOnly cookie and load the user
export const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  const decoded = AuthUtils.verifyRefreshToken(token);
  if (!decoded) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }

  try {
    const user = await GeneralUtils.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
