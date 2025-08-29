const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  adminName: { type: String, required: true },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});
const adminModel = mongoose.model('Admin', adminSchema);
module.exports = adminModel;
