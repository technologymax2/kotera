const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Safely extract controller methods with fallback checks
const register = authController.register || authController.createUser || ((req, res) => res.status(501).json({ message: "Register action not implemented" }));
const login = authController.login || ((req, res) => res.status(501).json({ message: "Login action not implemented" }));
const getProfile = authController.getProfile || ((req, res) => res.status(501).json({ message: "Get profile action not implemented" }));
const getUsers = authController.getUsers || authController.getAllUsers || ((req, res) => res.status(501).json({ message: "Get users action not implemented" }));
const toggleBlockUser = authController.toggleBlockUser || authController.blockUser || ((req, res) => res.status(501).json({ message: "Block action not implemented" }));
const deleteUser = authController.deleteUser || ((req, res) => res.status(501).json({ message: "Delete action not implemented" }));
const resetPassword = authController.resetPassword || ((req, res) => res.status(501).json({ message: "Reset password action not implemented" }));

// Public routes
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
