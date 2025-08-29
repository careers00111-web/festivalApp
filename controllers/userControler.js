const userModel = require("../models/userModel");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const importUsersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    const result = excelToJson({
      sourceFile: filePath,
      header: { rows: 1 },
      columnToKey: {
        A: "churchName",
        B: "name",
        C: "code",
        D: "birthDate",
      },
    });

    const data = result.Sheet1 || result[Object.keys(result)[0]];

    fs.removeSync(filePath);

    const filteredData = data.filter(
      (row) => row.name && row.churchName && row.code && row.birthDate
    );

    await userModel.insertMany(filteredData);

    res.status(200).json({
      message: "Users imported successfully",
      count: filteredData.length,
      users: filteredData,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate entry found (check name/code fields)",
        error: err.keyValue,
      });
    }

    console.error("Error importing users:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const users = await userModel.find().skip(skip).limit(limit);
    const totalUsers = await userModel.countDocuments();
    res.status(200).json({
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllUsersWithoutPagnation = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addUser = async (req, res) => {
  try {
    console.log(req.body);
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).json({ message: "User added successfully", newUser });
  } catch (err) {
    console.error("Error adding user:", err);
    res.json({
      status: "error",
      message: err.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const deletedUser = await userModel.findByIdAndDelete(id);
    console.log(deletedUser);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User deleted successfully", deleted: deletedUser });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "User not found" });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, churchName, code, birthDate } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, churchName, code, birthDate },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(updatedUser);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key error",
        field: err.keyValue,
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const searchUsers = async (req, res) => {
  try {
    const { name, churchName, birthdate } = req.query;

    if (!name || !churchName || !birthdate) {
      return res.status(400).json({ message: "يرجى إدخال جميع البيانات" });
    }

    const query = {
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      churchName: { $regex: new RegExp(`^${churchName.trim()}$`, "i") },
      birthDate: birthdate.trim(),
    };

    const user = await userModel.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "لا يوجد نتائج مطابقة" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ خطأ فعلي:", err);
    res.status(500).json({ message: "حدث خطأ في السيرفر", error: err.message });
  }
};

// Login function for users
const loginUser = async (req, res) => {
  try {
    const { name, churchName, birthDate } = req.body;

    if (!name || !churchName || !birthDate) {
      return res.status(400).json({
        message: "يرجى إدخال جميع البيانات المطلوبة",
      });
    }

    // Search for user with exact match
    const user = await userModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      churchName: { $regex: new RegExp(`^${churchName.trim()}$`, "i") },
      birthDate: birthDate.trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "بيانات غير صحيحة",
      });
    }

    // Generate JWT token
    const secretKey = process.env.JWT_SECRET || "your_secret_key_here";
    console.log("🔑 Using JWT secret for user:", secretKey ? "Set" : "Not Set");

    const token = jwt.sign(
      { userId: user._id, name: user.name, churchName: user.churchName },
      secretKey,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user._id,
        name: user.name,
        churchName: user.churchName,
        code: user.code,
        birthDate: user.birthDate,
      },
      token,
    });
  } catch (err) {
    console.error("❌ خطأ في تسجيل الدخول:", err);
    res.status(500).json({
      message: "حدث خطأ في السيرفر",
      error: err.message,
    });
  }
};

module.exports = {
  getAllUsersWithoutPagnation,
  getAllUsers,
  addUser,
  deleteUser,
  updateUser,
  searchUsers,
  importUsersFromExcel,
  loginUser,
};
