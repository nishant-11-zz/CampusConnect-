const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourcesByDepartment,
  addResource,
  searchResources
} = require('../controllers/studyHubController');

// Import middlewares
const { protect } = require('../utils/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createResourceSchema } = require('../validators/resourceValidator');

// PUBLIC ROUTES
router.get('/', getAllResources);
router.get('/department/:department', getResourcesByDepartment);
router.get('/search', searchResources);

//   PROTECTED ROUTE WITH VALIDATION
//   Only logged-in users can upload resources
router.post(
  '/',
  protect,
  validateRequest(createResourceSchema),
  addResource
);

module.exports = router;