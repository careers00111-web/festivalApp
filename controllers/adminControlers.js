const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Admin = require("../models/adminModel");

const registerAdmin = async (req, res) => {
  const { adminName, password } = req.body;
  if (!adminName || !password) {
    return res
      .status(400)
      .json({ message: "Please enter both adminName and password" });
  }
  try {
    const existAdmin = await Admin.findOne({ adminName });
    if (existAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(20);
    const hashPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ adminName, password: hashPassword });
    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        adminName: newAdmin.adminName,
      },
    });
  } catch (err) {
    console.error("❌ Admin registration error:", err.message);
    res.status(500).json({
      message: "Error registering admin",
      error: err.message,
    });
  }
};
const loginAdmin = async (req, res) => {
  const { adminName, password } = req.body;
  console.log({ adminName, password });

  if (!adminName || !password) {
    return res
      .status(400)
      .json({ message: "Please enter both adminName and password" });
  }
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) {
      return res.status(400).json({ message: "Invalid adminName or password" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid adminName or password" });
    }
    const payload = { adminId: admin._id, adminName: admin.adminName };
    const secretKey =
      process.env.JWT_SECRET || process.env.SECRET || "your_secret_key_here";
    console.log("🔑 JWT Secret Status:");
    console.log("   - JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not Set");
    console.log("   - SECRET:", process.env.SECRET ? "Set" : "Not Set");
    console.log(
      "   - Final Secret:",
      secretKey ? "Available" : "Using Default"
    );

    const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
      },
    });
  } catch (err) {
    console.error("❌ Admin login error:", err.message);

    // Handle specific JWT errors
    if (err.message.includes("secretOrPrivateKey")) {
      return res.status(500).json({
        message: "JWT secret not configured",
        error: "Please set JWT_SECRET environment variable",
      });
    }

    res.status(500).json({
      message: "Error logging in admin",
      error: err.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};
