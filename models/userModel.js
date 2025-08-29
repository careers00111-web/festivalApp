const mongoose = require("mongoose");



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
    },
    churchName: {
      type: String,
      required: [true, "Church name is required"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
    },
    birthDate: {
      type: String,
      required: [true, "Birth date is required"],
    },
  },
  { timestamps: true }
); 

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
