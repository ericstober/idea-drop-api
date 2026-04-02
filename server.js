import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set server port (use env variable or default to 8000)
const PORT = process.env.PORT || 8000;

// Connect to MongoDB database
connectDB();

// CORS configuration: define allowed frontend origins
const allowedOrigins = ["http://localhost:3000"];

// Enable CORS with credentials (cookies, auth headers, etc.)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Parse incoming JSON requests (req.body)
app.use(express.json());

// Parse URL-encoded data (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse cookies from request headers
app.use(cookieParser());

// Routes
// Mount idea-related routes under /api/ideas
app.use("/api/ideas", ideaRouter);

// Mount authentication routes under /api/auth
app.use("/api/auth", authRouter);

// 404 Fallback
// Catch any undefined routes and return a 404 error
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
// Handle all errors passed through next()
app.use(errorHandler);

// Start Server
// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
