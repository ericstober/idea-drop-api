import express from "express";
import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJWTSecret.js";
import generateToken from "../utils/generateToken.js";

// Create an Express router instance
const router = express.Router();

// @route POST apit/auth/register
// @description Register new user
// @access Public
router.post("/register", async (req, res, next) => {
  try {
    // Extract user input from request body
    const { name, email, password } = req.body || {};

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    // Check if a user already exists with the given email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      throw new Error("User cannot be created");
    }

    // Create new user (password will be hashed via schema middleware)
    const user = await User.create({ name, email, password });

    // Create JWT payload
    const payload = { userId: user._id.toString() };

    // Genereate short-lived access token and long-lived refresh token
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Store refresh token in a secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevent access from JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response with access token and user info
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Log error and pass to global error handler
    console.error(error);
    next(error);
  }
});

// @route POST apit/auth/login
// @description Authenticate user
// @access Public
router.post("/login", async (req, res, next) => {
  try {
    // Extract credentials from request body
    const { email, password } = req.body || {};

    // Validate input
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, deny access
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Compare entered password with stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Create JWT payload
    const payload = { userId: user._id.toString() };

    // Generate tokens
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// @route POST apit/auth/logout
// @description Logout user and clear refresh token
// @access Private
router.post("/logout", (req, res) => {
  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  // Send confirmation response
  res.status(200).json({ message: "Logged out successfully" });
});

// @route POST apit/auth/refresh
// @description Generate new access token from refresh token
// @access Public (needs valid refresh token in cookie)
router.post("/refresh", async (req, res, next) => {
  try {
    // Get refresh token from cookies
    const token = req.cookies?.refreshToken;
    console.log("Refreshing token...");

    // If no token is present, deny access
    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    // Verify refresh token and extract payload
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Find user associated with token
    const user = await User.findById(payload.userId);

    // If user does not exist, deny access
    if (!user) {
      res.status(401);
      throw new Error("No user");
    }

    // Generate new access token
    const newAccessToken = await generateToken({ userId: user._id.toString() }, "1m");

    // Return new access token and user info
    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle token verification or other errors
    res.status(401);
    next(error);
  }
});

export default router;
