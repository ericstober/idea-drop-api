import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJWTSecret.js";

// Generates a JWT
// @param {Object} payload - Data to embed in the token
// @param {string} expiresIn - Expiration time (e.g., '15m', '7d', '30d')
// @returns {Promise<string>} Signed JWT

const generateToken = async (payload, expiresIn = "15m") => {
  return await new SignJWT(payload)
    // Set the algorithm used for signing (HMAC SHA-256)
    .setProtectedHeader({ alg: "HS256" })

    // Add "issued at" timestamp to the token
    .setIssuedAt()

    // Set token expiration time
    .setExpirationTime(expiresIn)

    // Sign the token using the secret key
    .sign(JWT_SECRET);
};

export default generateToken;
