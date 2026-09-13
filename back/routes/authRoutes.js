const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  getUsers,
  toggleBlockUser,
  deleteUser,
  resetPassword,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.post("/login", login);

// ============================================================
// AUTHENTICATED USER ROUTES
// ============================================================
router.get("/profile", protect, getProfile);

// ============================================================
// ADMIN-ONLY MANAGEMENT ROUTES
// ============================================================
// Create new users (Operators, Verifiers, Admins)
router.post("/register", protect, adminOnly, register);

// Fetch all users for dashboard tables
router.get("/users", protect, adminOnly, getUsers);

// Block & Unblock operations
router.put("/block/:id", protect, adminOnly, (req, res, next) => {
  req.params.action = "block";
  toggleBlockUser(req, res, next);
});

router.put("/unblock/:id", protect, adminOnly, (req, res, next) => {
  req.params.action = "unblock";
  toggleBlockUser(req, res, next);
});

// Reset user password
router.put("/reset-password/:id", protect, adminOnly, resetPassword);

// Delete user profile
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
