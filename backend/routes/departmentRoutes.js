const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments
} = require('../controllers/departmentController');

// Import middlewares
const { protect, admin } = require('../utils/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validators/departmentValidator');

/**
 * PUBLIC ROUTES
 */
router.get('/', getDepartments);
router.get('/search', searchDepartments);
router.get('/:id', getDepartmentById);

/**
 * ADMIN-ONLY ROUTES WITH VALIDATION
 */
router.post(
  '/',
  protect,
  admin,
  validateRequest(createDepartmentSchema),
  addDepartment
);

router.put(
  '/:id',
  protect,
  admin,
  validateRequest(updateDepartmentSchema),
  updateDepartment
);

router.delete(
  '/:id',
  protect,
  admin,
  deleteDepartment
);

module.exports = router;