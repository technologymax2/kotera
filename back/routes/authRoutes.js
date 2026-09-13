const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  getUsers,
  toggleBlockUser,
  resetPassword,
  deleteUser,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public authentication routes
router.post("/login", login);

// Authenticated user routes
router.get("/profile", protect, getProfile);

// Admin-only management routes
router.post("/register", protect, adminOnly, register);
router.post("/create-user", protect, adminOnly, register);
router.get("/users", protect, adminOnly, getUsers);

router.put("/block/:id", protect, adminOnly, (req, res, next) => {
  req.params.action = "block";
  toggleBlockUser(req, res, next);
});

router.put("/unblock/:id", protect, adminOnly, (req, res, next) => {
  req.params.action = "unblock";
  toggleBlockUser(req, res, next);
});

router.put("/reset-password/:id", protect, adminOnly, resetPassword);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
