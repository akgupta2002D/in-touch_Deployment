import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { clear } from "console";

dotenv.config();

// class that will handle things like password hashing, encoding/decoding tokens, token verification, getting the user from a token, etc.
const AuthUtils = {
  // hash password function
  // input : password (string)
  // output: hashed password (string)
  hashPassword: async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  },

  // compare password function
  // input : password (string), hashedPassword (string)
  // output: boolean
  comparePassword: async (password, hashedPassword) => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  },

  //issue JWT token function
  // input : user object
  // output : access token, refresh token
  issueTokens: (user) => {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new Error(
        "Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET environment variables"
      );
    }
    const accessToken = jwt.sign({ id: user.id }, accessSecret, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign({ id: user.id }, refreshSecret, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  },

  // verify access token
  verifyAccessToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return decoded;
    } catch (err) {
      return null;
    }
  },

  // verify refresh token
  verifyRefreshToken: (token) => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      return decoded;
    } catch (err) {
      return null;
    }
  },

  // set refresh token cookies
  setRefreshTokenCookie: (res, token) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", token, cookieOptions);
  },

  clearRefreshTokenCookie: (res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
  },

  // create email verification token
  createEmailVerificationToken: async () => {
    const plain_token = crypto.randomBytes(32).toString("hex");
    const hashed_token = await bcrypt.hash(plain_token, 10);
    return { plain_token, hashed_token };
  },

  verifyEmailVerificationToken: async (plain_token, hashed_token) => {
    if (!plain_token || !hashed_token) return false;

    return await bcrypt.compare(plain_token, hashed_token);
  },
};

export default AuthUtils;
