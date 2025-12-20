const Joi = require('joi');

// Validation schema for creating a new department
const createDepartmentSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Department name must be at least 3 characters',
      'string.max': 'Department name cannot exceed 100 characters',
      'any.required': 'Department name is required'
    }),

  code: Joi.string()
    .min(2)
    .max(10)
    .uppercase()
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.min': 'Department code must be at least 2 characters',
      'string.pattern.base': 'Department code must contain only uppercase letters and numbers',
      'any.required': 'Department code is required'
    }),

  description: Joi.string()
    .max(500)
    .allow('')
    .optional(),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'any.required': 'Latitude is required'
    }),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'any.required': 'Longitude is required'
    }),

  building: Joi.string()
    .max(100)
    .allow('')
    .optional(),

  floor: Joi.number()
    .min(0)
    .max(10)
    .optional(),

  mapLink: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional(),

  photo360Link: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional()
}).options({ stripUnknown: true });

// Validation schema for updating a department
const updateDepartmentSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .optional(),

  code: Joi.string()
    .min(2)
    .max(10)
    .uppercase()
    .pattern(/^[A-Z0-9]+$/)
    .optional(),

  description: Joi.string()
    .max(500)
    .allow('')
    .optional(),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional(),

  building: Joi.string()
    .max(100)
    .allow('')
    .optional(),

  floor: Joi.number()
    .min(0)
    .max(10)
    .optional(),

  mapLink: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional(),

  photo360Link: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional()
})
  .min(1)
  .options({ stripUnknown: true })
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema
};