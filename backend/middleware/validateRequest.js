/**
 * Reusable validation middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        answer: `Validation failed: ${errors}`
      });
    }

    // Attach cleaned & validated data to request
    req.body = value;
    next();
  };
};

module.exports = validateRequest;