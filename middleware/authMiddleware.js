import { jwtVerify } from "jose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { JWT_SECRET } from "../utils/getJWTSecret.js";

// Load environment variables
dotenv.config();

// Middleware to protect routes (required valid JWT)
export const protect = async (req, res, next) => {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if the header exists and startes with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    // Extract the token from the header (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    // Verify the token using the JWT secret
    // payload contains the decoed token data (e.g., userId)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Find the user in the database using the ID from the token payload
    // Only return selected fields for security and performance
    const user = await User.findById(payload.userId).select("_id name email");

    // If no user is found, deny access
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Attach the user object to the request for use in protected routes
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Set unauthorized status and pass error to Express error handler
    res.status(401);
    next(new Error("Not authorized, token failed"));
  }
};
