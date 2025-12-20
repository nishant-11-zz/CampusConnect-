const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const path = req.originalUrl.toLowerCase();

  let msg = "Something went wrong. Please try again.";

  // Mongoose Cast Error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    msg = "Invalid ID format. Please check the request and try again.";
  }
  // Validation Error
  else if (err.name === 'ValidationError') {
    const firstError = Object.values(err.errors)[0].message;
    msg = firstError.includes('required')
      ? "Some required data is missing. Please check and resend."
      : firstError;
  }
  // Duplicate Key
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    msg = field === 'email'
      ? "An account with this email already exists. Try logging in."
      : `A ${field} "${value}" already exists.`;
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    msg = "Invalid token. Please log in again.";
  }
  else if (err.name === 'TokenExpiredError') {
    msg = "Your session has expired. Please log in again.";
  }
  // AI Route Errors
  else if (path.includes("/ai")) {
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("timeout") || errMsg.includes("fetch") || errMsg.includes("network")) {
      msg = "The AI is slow to respond – please try again shortly.";
    }
    else if (errMsg.includes("gemini") || errMsg.includes("generate") || errMsg.includes("ai")) {
      msg = "The AI had trouble generating that. Try rephrasing your question.";
    }
    else {
      msg = "I couldn't get a valid AI response right now. Please try again.";
    }
  }
  // Department Route Errors
  else if (path.includes("/departments")) {
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("not found") || errMsg.includes("department")) {
      msg = "That department doesn't exist. Try another name or check spelling.";
    }
    else if (errMsg.includes("fetch") || errMsg.includes("database")) {
      msg = "Couldn't fetch department details right now. Try again later.";
    }
  }
  // StudyHub Route Errors
  else if (path.includes("/studyhub")) {
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("not found") || errMsg.includes("resource")) {
      msg = "No study material found for that query. Try different keywords.";
    }
  }
  // Auth Route Errors
  else if (path.includes("/auth")) {
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("credential") || errMsg.includes("password")) {
      msg = "Invalid email or password. Please try again.";
    }
  }
  // Database / Network
  else if (err.message.toLowerCase().includes("mongo") || err.message.toLowerCase().includes("connect")) {
    msg = "Database connection issue – please retry in a few seconds.";
  }
  else if (err.message.toLowerCase().includes("network") || err.message.toLowerCase().includes("fetch")) {
    msg = "Network issue detected – please check your internet connection.";
  }
  // Custom message
  else if (err.message && !err.message.toLowerCase().includes("stack")) {
    msg = err.message;
  }

  res.status(statusCode).json({ answer: msg });
};

module.exports = errorHandler;