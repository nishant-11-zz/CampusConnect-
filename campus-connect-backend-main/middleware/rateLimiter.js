/**
 * Rate limiting middleware using express-rate-limit
 */
const rateLimit = require('express-rate-limit');

/**
 * GENERAL API LIMITER
 * 100 requests per IP every 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    answer: 'Too many requests. Please try again later.'
  },
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * AI QUERY LIMITER
 * 10 requests per IP per minute
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    answer: 'Too many AI queries. Please slow down.'
  }
});

/**
 * AUTH LIMITER
 * 5 login attempts per IP every 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    answer: 'Too many login attempts. Try again later.'
  }
});

module.exports = {
  apiLimiter,
  aiLimiter,
  authLimiter
};