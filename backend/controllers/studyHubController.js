const Resource = require('../models/Resource');
const { createResourceSchema } = require('../validators/resourceValidator');

// GET ALL RESOURCES — PUBLIC: ONLY APPROVED
const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50);

    if (resources.length === 0) {
      return res.json({
        answer: "No study materials uploaded yet. Be the first to add notes in **StudyHub**!"
      });
    }

    res.json({
      answer: `Here are the latest ${resources.length} study materials:`,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// GET BY DEPARTMENT NAME — PUBLIC: ONLY APPROVED
const getResourcesByDepartment = async (req, res, next) => {
  try {
    const { department } = req.params;
    const deptName = decodeURIComponent(department).trim();

    if (!deptName) {
      return next(new Error('Department name is required'));
    }

    const resources = await Resource.find({
      department: { $regex: `^${deptName}$`, $options: 'i' },
      status: 'approved'  // ← ONLY APPROVED
    })
      .sort({ createdAt: -1 })
      .limit(20);

    if (resources.length === 0) {
      return res.json({
        answer: `No study materials found for **${deptName.toUpperCase()}**.\n\nTry:\n• Uploading your notes\n• Checking "CSE" or "Civil"\n• Searching by keyword`
      });
    }

    res.json({
      answer: `Found ${resources.length} resource(s) for **${deptName.toUpperCase()}**:`,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// ADD NEW RESOURCE — PROTECTED: UNCHANGED (PENDING BY DEFAULT)
const addResource = async (req, res, next) => {
  try {
    // VALIDATE INPUT USING JOI
    const { error, value } = createResourceSchema.validate(req.body, {
      abortEarly: false
    });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return next(new Error(message));
    }

    // Ensure user is logged in
    if (!req.user) {
      return next(new Error('You must be logged in to upload resources'));
    }

    // Set uploader
    value.uploadedBy = req.user._id;

    // Set defaults for optional fields
    value.fileType = value.fileType || 'other';
    value.category = value.category || 'other';
    value.semester = value.semester || null;
    value.tags = value.tags || [];

    const resource = await Resource.create(value);

    res.status(201).json({
      answer: `Your resource **${resource.title}** has been uploaded and is **pending admin approval**.`,
      resource
    });
  } catch (error) {
    next(error);
  }
};

// SEARCH RESOURCES — PUBLIC: ONLY APPROVED
const searchResources = async (req, res, next) => {
  try {
    const { keyword, department } = req.query;

    if (!keyword && !department) {
      return next(new Error('Provide "keyword" or "department" to search'));
    }

    const filter = { status: 'approved' }; // ← BASE FILTER: ONLY APPROVED

    if (department) {
      const dept = decodeURIComponent(department).trim();
      if (dept.length < 2) {
        return next(new Error('Department name too short'));
      }
      filter.department = { $regex: dept, $options: 'i' };
    }

    if (keyword) {
      const term = decodeURIComponent(keyword).trim();
      if (term.length < 2) {
        return next(new Error('Search keyword must be at least 2 characters'));
      }
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { title: regex },
        { tags: regex },
        { subject: regex }
      ];
    }

    const resources = await Resource.find(filter)
      .select('title description department fileUrl tags createdAt fileType category semester subject')
      .limit(20)
      .sort({ createdAt: -1 });

    if (resources.length === 0) {
      const searchHint = keyword ? `"${decodeURIComponent(keyword)}"` : (department ? `**${decodeURIComponent(department).toUpperCase()}**` : '');
      return res.json({
        answer: `No results found for ${searchHint}.\n\nTry:\n• "DSA notes"\n• "Thermodynamics"\n• "CSE department"\n• Broader keywords`
      });
    }

    const count = resources.length;
    const deptHint = department ? ` in **${decodeURIComponent(department).toUpperCase()}**` : '';
    res.json({
      answer: `Found ${count} result(s)${deptHint}:`,
      resources
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourcesByDepartment,
  addResource,
  searchResources
};