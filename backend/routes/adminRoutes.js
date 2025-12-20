const express = require("express");
const router = express.Router();
const { protect, admin } = require("../utils/authMiddleware");
const Resource = require("../models/Resource");

/**
 * GET ALL RESOURCES (including pending) - ADMIN ONLY
 */
router.get("/resources", protect, admin, async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      answer: `Found ${resources.length} resources in the system.`,
      resources,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * APPROVE RESOURCE - ADMIN ONLY
 */
router.put("/resources/:id/approve", protect, admin, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "approved", isVerified: true },
      { new: true }
    );

    if (!resource) {
      return next(new Error("Resource not found"));
    }

    res.json({
      answer: `Resource **${resource.title}** has been approved.`,
      resource,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * REJECT RESOURCE - ADMIN ONLY
 */
router.put("/resources/:id/reject", protect, admin, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!resource) {
      return next(new Error("Resource not found"));
    }

    res.json({
      answer: `Resource **${resource.title}** has been rejected.`,
      resource,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE RESOURCE - ADMIN ONLY
 */
router.delete("/resources/:id", protect, admin, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return next(new Error("Resource not found"));
    }

    res.json({
      answer: `Resource **${resource.title}** has been deleted.`,
      message: "Resource removed successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
