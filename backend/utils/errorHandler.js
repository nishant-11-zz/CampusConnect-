/**
 * Standardized error response
 * @param {Object} res - Express response object
 * @param {number} code - HTTP status code
 * @param {string} message - Error message
 */
const errorResponse = (res, code, message) => {
  res.status(code).json({
    success: false,
    error: message
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  errorResponse(res, 404, `Route ${req.originalUrl} not found`);
};

/**
 * General Error Handler (catch-all)
 */
const generalErrorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return errorResponse(res, 400, messages);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 400, `${field} already exists`);
  }

  // Default to 500
  errorResponse(res, err.status || 500, err.message || 'Internal Server Error');
};

module.exports = {
  errorResponse,
  notFoundHandler,
  generalErrorHandler
};