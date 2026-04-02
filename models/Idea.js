import mongoose from "mongoose";

// Define the schema for an Idea
const ideaScheme = new mongoose.Schema(
  {
    // Reference to the user who created the idea
    user: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
      ref: "User", // References the User collection
      required: true,
    },

    // Title of the idea
    title: {
      type: String,
      required: true,
      trim: true, // Remove whitespace
    },

    // Short summary of the idea
    summary: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed description of the idea
    description: {
      type: String,
      required: true,
    },

    // Array of tags for categorizing the idea (e.g., "AI", "Fintech")
    tags: {
      type: [String], // Array of strings
      default: [], // Defaults to empty array if not provided
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
);

// Create the Idea model from the schema
// This represents the "ideas" collection in MongoDB
const Idea = mongoose.model("Idea", ideaScheme);

export default Idea;
