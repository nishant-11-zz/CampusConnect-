const Department = require('../models/Department');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validators/departmentValidator');

// GET all
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).limit(50);
    
    if (departments.length === 0) {
      return res.json({ answer: "No departments found in the system yet." });
    }

    res.json({
      answer: `Here are ${departments.length} departments on campus:`,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

// GET by ID
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(new Error('Department not found'));
    }

    // Increment search analytics
    await department.incrementSearch();

    res.json({
      answer: `Found: **${department.name}**`,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// POST — WITH JOI VALIDATION
const addDepartment = async (req, res, next) => {
  try {
    // VALIDATE INPUT
    const { error, value } = createDepartmentSchema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message));
    }

    // Check if code already exists
    const existingByCode = await Department.findOne({ code: value.code });
    if (existingByCode) {
      return next(new Error(`Department with code "${value.code}" already exists`));
    }

    // Optional: prevent duplicate name (case-insensitive)
    const existingByName = await Department.findOne({ 
      name: { $regex: `^${value.name}$`, $options: 'i' } 
    });
    if (existingByName) {
      return next(new Error(`Department "${value.name}" already exists`));
    }

    const department = await Department.create(value);

    res.status(201).json({
      answer: `Added new department: **${department.name}** (${department.code})`,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// PUT — WITH JOI VALIDATION
const updateDepartment = async (req, res, next) => {
  try {
    // VALIDATE INPUT: at least one field
    const { error, value } = updateDepartmentSchema.validate(req.body);
    if (error) {
      return next(new Error(error.details[0].message));
    }

    // Prevent duplicate code if updating code
    if (value.code) {
      const existing = await Department.findOne({ 
        code: value.code,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return next(new Error(`Code "${value.code}" is already used by another department`));
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!department) {
      return next(new Error('Department not found'));
    }

    res.json({
      answer: `Updated: **${department.name}**`,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new Error('Department not found'));
    }

    res.json({
      answer: `Deleted: **${department.name}**`,
      message: 'Department removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// SEARCH
const searchDepartments = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name || name.trim().length < 2) {
      return next(new Error('Please enter at least 2 characters to search'));
    }

    const searchTerm = name.trim();
    const departments = await Department.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .select('name code description latitude longitude mapLink photo360Link building floor')
      .limit(20)
      .sort({ name: 1 });

    if (departments.length === 0) {
      return res.json({
        answer: `No departments found for "${searchTerm}".\n\nTry:\n• "CSE"\n• "Civil"\n• "Mechanical"\n• "Library"`
      });
    }

    // Increment search count for each result
    departments.forEach(dept => dept.incrementSearch());

    res.json({
      answer: `Found ${departments.length} department(s) matching "${searchTerm}":`,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments
};