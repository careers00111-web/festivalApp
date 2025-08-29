const express = require("express");
const { loginAdmin, registerAdmin } = require("../controllers/adminControlers");
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
module.exports = router;
