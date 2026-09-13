require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const FaceUser = require("./models/FaceUser");

const PORT = process.env.PORT || 10000;

let server;

const seedFirstAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "mamex@poessa")
      .trim()
      .toLowerCase();

    // Query the actual FaceUser model used by your auth endpoints
    const existingAdmin = await FaceUser.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "12345678";

      // Pass raw password; FaceUser's pre-save hook handles bcrypt hashing
      const adminUser = new FaceUser({
        firstName: "System",
        lastName: "Administrator",
        username: "mamex",
        email: adminEmail,
        password: defaultPassword,
        role: "admin",
        isActive: true,
      });

      await adminUser.save();
      console.log(`👤 First admin user created successfully in FaceUser (${adminEmail})`);
    } else {
      console.log("👤 Admin user already exists. Skipping creation.");
    }
  } catch (error) {
    console.error("⚠️ Failed to seed first admin user:", error.message);
  }
};

const connectDB = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2. Seed First Admin User
    await seedFirstAdmin();

    // 3. Create HTTP Server
    server = http.createServer(app);

    // 4. Start Server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Start the sequence
connectDB();

// Global Error Handling
const handleFatalError = (type, err) => {
  console.error(`❌ ${type}:`, err.message || err);
  if (server) {
    server.close(() => {
      console.log("💤 Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) =>
  handleFatalError("Unhandled Rejection", err)
);
process.on("uncaughtException", (err) =>
  handleFatalError("Uncaught Exception", err)
);
