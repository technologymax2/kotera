require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const bcrypt = require("bcryptjs");
const app = require("./app"); // Ensure your app.js exports the express 'app' object, not app.listen()

const PORT = process.env.PORT || 10000;

let server;

// User Schema matching your app's user collection
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const seedFirstAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "mamex@poessa";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "12345678";

      // Hash password using bcrypt so login comparisons succeed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const adminUser = new User({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log(`👤 First admin user created successfully (${adminEmail})`);
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
