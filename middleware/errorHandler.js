// Global error-handling middleware for Express
// This should be used after all routes to catch errors
export const errorHandler = (error, req, res, next) => {
  // Use the current response status code if set, otherwise default to 500 (server error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Set the response status code
  res.status(statusCode);

  // Send a JSON response with error details
  res.json({
    // Main error message
    message: error.message,

    // Include stack trace only in development for debugging
    // Hide it in production for security reasons
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
};
