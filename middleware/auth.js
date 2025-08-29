const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");

      if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format. Use 'Bearer <token>'" });
    }

  const token = authHeader.replace("Bearer ", "");

  try {
    const secretKey =
      process.env.JWT_SECRET || process.env.SECRET || "your_secret_key_here";
    console.log("🔑 Auth middleware - JWT Secret Status:");
    console.log("   - JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not Set");
    console.log("   - SECRET:", process.env.SECRET ? "Set" : "Not Set");

    const verified = jwt.verify(token, secretKey);
    req.admin = verified;
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);

    // Handle specific JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token format" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = {
  auth,
};
