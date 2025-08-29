const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const app = express();
// Use PORT provided in environment or default to 3000
const port = process.env.PORT || 3000;
console.log("🔧 Server Configuration:");
console.log("   - PORT from env:", process.env.PORT);
console.log("   - Final PORT:", port);
console.log("   - NODE_ENV:", process.env.NODE_ENV);
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  console.log("🏥 Health check requested");

  // Check if database is connected
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  // Set headers for better compatibility
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const response = {
    status: "success",
    message: "API is running...",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    uptime: process.uptime(),
    version: "1.0.0",
    port: process.env.PORT || 3000,
  };

  console.log("✅ Health check response:", response);
  res.status(200).json(response);
});

// Additional health check for Railway
app.get("/health", (req, res) => {
  // Check if database is connected
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/admin", adminRouter);
app.use("/users", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/festival_db";
console.log("=== Environment Variables ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not Set");
console.log("PORT:", port);
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("🚀 Redeploy triggered at:", new Date().toISOString());
console.log("===========================");

// Connect to MongoDB with better error handling
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ connected to db");
    // Start server only after DB connection
    // Listen on `port` and 0.0.0.0 as per Railway docs
    console.log("🚀 Starting server...");
    console.log("   - Binding to: 0.0.0.0:" + port);

    const server = app.listen(port, "0.0.0.0", function () {
      console.log(`🚀 Server is running on port ${port}!`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);

      // Log that server is ready for health checks
      console.log("✅ Server is ready to accept requests");

      // Additional log for Railway health check
      console.log("🏥 Railway health check endpoint: /");

      // Log server info for debugging
      console.log("🔧 Server configuration:");
      console.log("   - Port:", port);
      console.log("   - Environment:", process.env.NODE_ENV || "development");
      console.log(
        "   - Database:",
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      );
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      console.error("   - Error code:", err.code);
      console.error("   - Error message:", err.message);

      if (err.code === "EADDRINUSE") {
        console.log("🔄 Port is in use, trying alternative port...");
        // Try alternative port as per Railway docs
        server.listen(0, "0.0.0.0");
      } else {
        console.log("💥 Fatal error, exiting...");
        process.exit(1);
      }
    });

    // Handle process termination
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    console.error("Error details:", {
      code: err.code,
      codeName: err.codeName,
      message: err.message,
    });

    // Don't exit in production, let Railway handle it
    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Retrying connection in 5 seconds...");
      setTimeout(() => {
        mongoose
          .connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          })
          .then(() => {
            console.log("✅ Reconnected to db");
            // Restart server after reconnection
            const server = app.listen(port, "0.0.0.0", function () {
              console.log(`🚀 Server restarted on port ${port}!`);
            });
          })
          .catch((retryErr) => {
            console.error("❌ Retry failed:", retryErr.message);
            process.exit(1);
          });
      }, 5000);
    } else {
      process.exit(1);
    }
  });
