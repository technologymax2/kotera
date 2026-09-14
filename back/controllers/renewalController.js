const Renewal = require("../models/Renewal");

// ==============================
// Create Renewal
// POST /api/renewals
// ==============================
exports.createRenewal = async (req, res) => {
  try {
    const { title, message, startDate, endDate } = req.body;

    if (!title || !message || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date.",
      });
    }

    // Close previous active renewals
    await Renewal.updateMany({ active: true }, { $set: { active: false } });

    const renewal = await Renewal.create({
      title,
      message,
      startDate: start,
      endDate: end,
      active: true,
    });

    res.status(201).json({
      success: true,
      message: "Renewal created successfully.",
      data: renewal,
    });
  } catch (err) {
    console.error("Create Renewal Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Current Renewal
// GET /api/renewals/current
// ==============================
exports.getCurrentRenewal = async (req, res) => {
  try {
    // 1. First attempt: Get explicitly marked active renewal or fall back to latest created
    let renewal = await Renewal.findOne({ active: true }).sort({ createdAt: -1 });

    if (!renewal) {
      renewal = await Renewal.findOne().sort({ createdAt: -1 });
    }

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "No active renewal found.",
      });
    }

    const now = new Date();
    const start = new Date(renewal.startDate);
    const end = new Date(renewal.endDate);

    let status = "ACTIVE";

    if (now < start) {
      status = "NOT_STARTED";
    } else if (now > end) {
      status = "EXPIRED";
    }

    res.json({
      success: true,
      status,
      data: renewal,
    });
  } catch (err) {
    console.error("Get Current Renewal Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Update Renewal
// PUT /api/renewals/:id
// ==============================
exports.updateRenewal = async (req, res) => {
  try {
    const { startDate, endDate, active } = req.body;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date.",
      });
    }

    // Ensure active state remains true when updating
    const updateData = {
      ...req.body,
      active: active !== undefined ? active : true,
    };

    const updated = await Renewal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found.",
      });
    }

    res.json({
      success: true,
      message: "Renewal updated successfully.",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// Delete Renewal
// DELETE /api/renewals/:id
// ==============================
exports.deleteRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found.",
      });
    }

    await renewal.deleteOne();

    res.json({
      success: true,
      message: "Renewal deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// GET ALL RENEWALS
// ==============================
exports.getRenewals = async (req, res) => {
  try {
    const renewals = await Renewal.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: renewals,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
