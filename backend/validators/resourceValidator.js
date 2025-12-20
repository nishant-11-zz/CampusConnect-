const Joi = require('joi');

/**
 * Validation schema for creating a new study resource
 */
const createResourceSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  department: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'Department must be at least 2 characters',
      'any.required': 'Department is required'
    }),

  fileUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .messages({
      'string.uri': 'File URL must be a valid link starting with http:// or https://',
      'any.required': 'File URL is required'
    }),

  fileType: Joi.string()
    .valid('pdf', 'doc', 'ppt', 'image', 'video', 'other')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'File type must be one of: pdf, doc, ppt, image, video, other'
    }),

  category: Joi.string()
    .valid('notes', 'assignments', 'previous-papers', 'lab-manual', 'syllabus', 'other')
    .lowercase()
    .optional()
    .messages({
      'any.only': 'Category must be one of: notes, assignments, previous-papers, lab-manual, syllabus, other'
    }),

  semester: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      'number.min': 'Semester must be between 1 and 8',
      'number.max': 'Semester must be between 1 and 8',
      'number.integer': 'Semester must be a whole number'
    }),

  subject: Joi.string()
    .max(150)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Subject name cannot exceed 150 characters'
    }),

  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .lowercase()
        .max(50)
        .messages({
          'string.max': 'Each tag cannot exceed 50 characters'
        })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 tags allowed'
    })
})
  .options({ stripUnknown: true })
  .messages({
    'object.unknown': 'Invalid field: "{#key}" is not allowed'
  });

module.exports = {
  createResourceSchema
};