import dotenv from "dotenv";

// Initialize dotenv so variables are available
dotenv.config();

// Convert the JWT secret string into a Uint8Array
// This format is required by the "jose" library for signing/verifying tokens
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
