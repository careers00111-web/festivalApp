const express = require("express");

const {
  getAllUsers,
  addUser,
  deleteUser,
  updateUser,
  searchUsers,
  getAllUsersWithoutPagnation,
  insertSheet,
  importUsersFromExcel,
  loginUser,
} = require("../controllers/userControler");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", auth, getAllUsers);
router.get("/getAll", auth, getAllUsersWithoutPagnation);
router.post("/add", auth, addUser);
router.delete("/delete/:id", auth, deleteUser);
router.put("/update/:id", auth, updateUser);
router.get("/search", searchUsers);
router.post("/login", loginUser);
router.post("/import-excel", upload.single("file"), importUsersFromExcel);
module.exports = router;
