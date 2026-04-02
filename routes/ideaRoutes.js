import express from "express";
import Idea from "../models/Idea.js";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";

// Create router instance
const router = express.Router();

// @route GET /api/ideas
// @description Get all ideas
// @access Public
// @query _limit (optional limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    // Parse optional limit query parameter
    const limit = parseInt(req.query._limit);

    // Create query to fetch ideas sorted by newest first
    const query = Idea.find().sort({ createdAt: -1 });

    // Apply limit if valid number is provided
    if (!isNaN(limit)) {
      query.limit(limit);
    }

    // Execute query
    const ideas = await query.exec();

    // Return ideas
    res.json(ideas);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// @route GET /api/ideas/:id
// @description Get single idea
// @access Private (requires authentication)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    // Find idea by ID
    const idea = await Idea.findById(id);

    // If not found, return 404
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    // Return idea
    res.json(idea);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// @route POST /api/ideas
// @description Create new idea
// @access Public
router.post("/", protect, async (req, res, next) => {
  try {
    // Extract fields from request body
    const { title, summary, description, tags } = req.body || {};

    // Validate required fields
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    // Normalize tags:
    // - If string → split by comma
    // - If array → use as is
    // - Otherwise → default to empty array
    const normalizedTags =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : Array.isArray(tags)
          ? tags
          : [];

    // Create new idea
    const newIdea = new Idea({
      title,
      summary,
      description,
      tags: normalizedTags,
      user: req.user.id, // Attach authenticated user
    });

    // Save idea to database
    const savedIdea = await newIdea.save();

    // Return created idea
    res.status(201).json(savedIdea);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// @route DELETE /api/ideas/:id
// @description Delete idea
// @access Private (only owner can delete)
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    // Find idea
    const idea = await Idea.findById(id);

    // If not found, return 404
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    // Ensure the authenticated user owns the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this idea");
    }

    // Delete idea
    await idea.deleteOne();

    // Return success message
    res.json({ message: "Idea deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// @route PUT /api/ideas/:id
// @description Update idea
// @access Private (only owner can update)
router.put("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    // Find idea
    const idea = await Idea.findById(id);

    // If not found, return 404
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    // Ensure the authenticated user owns the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this idea");
    }

    // Extract updated fields
    const { title, summary, description, tags } = req.body || {};

    // Validate required fields
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }

    // Normalize tags (same logic as create)
    const normalizedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

    // Update fields
    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = normalizedTags;

    // Save updated idea
    const updatedIdea = await idea.save();

    // Return updated idea
    res.json(updatedIdea);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
