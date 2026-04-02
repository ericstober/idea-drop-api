import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the schema for a User
const userSchema = new mongoose.Schema(
  {
    // User's name
    name: {
      type: String,
      required: true,
      trim: true, // Remove whitespace
    },

    // User's email (used for login)
    email: {
      type: String,
      required: true,
      unique: true, // Must be unique across users
      lowercase: true, // Normalize email to lowercase
      trim: true,
    },

    // User's password (stored as hashed value)
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum length for security
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
);

// Middleware: hash password before saving to database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10);

  // Hash the password and replace the plain text version
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Returns true if passwords match, false otherwise
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
