const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

/* ==========================================
   CORS (Sanitized & Multi-Domain Support)
========================================== */

const cleanClientUrl = (process.env.CLIENT_URL || "")
  .replace(/["'\r\n]/g, "")
  .trim()
  .replace(/\/$/, "");

const allowedOrigins = [
  cleanClientUrl,
  "https://kotera-olive.vercel.app",
  "https://kotera-blush.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const reqOrigin = origin.replace(/["'\r\n]/g, "").trim().replace(/\/$/, "");

      if (allowedOrigins.includes(reqOrigin) || /\.vercel\.app$/.test(reqOrigin)) {
        return callback(null, reqOrigin);
      }
      return callback(new Error("CORS policy violation"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==========================================
   Body Parser
========================================== */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ==========================================
   Static Files
========================================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==========================================
   Routes
========================================== */

const authRoutes = require("./routes/authRoutes");
const pensionerRoutes = require("./routes/pensionerRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const renewalRoutes = require("./routes/renewalRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Mount authRoutes on both /api/auth and /api/admin
app.use("/api/auth", authRoutes);
app.use("/api/admin", authRoutes);

app.use("/api/renewals", renewalRoutes);
app.use("/api/pensioners", pensionerRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

/* ==========================================
   Health Check
========================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application: "POESSA Face Verification API",
    version: "1.0.0",
    status: "Running",
  });
});

/* ==========================================
   404 Handler
========================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==========================================
   Global Error Handler
========================================== */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
