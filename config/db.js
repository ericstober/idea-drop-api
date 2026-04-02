import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Function to establish a connection to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI stored in environment variables
    const connection = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message with the connected host
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    // If connection fails, log the error message
    console.error(`Error: ${error.message}`);

    // Exit the application with failure status
    process.exit(1);
  }
};

export default connectDB;
