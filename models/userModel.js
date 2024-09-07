const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: "A password is required",
  },
  confirmPassword: {
    type: String,
    required: "A confirm password is required",
    validate: [
      function (val) {
        return val === this.password;
      },
      "Passwords must match",
    ],
  },
  email: {
    type: String,
    required: "An email is required",
    validate: [
      function (val) {
        return val.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      },
      "Email must be valid",
    ],
  },
  name: {
    type: String,
    max: 40,
  },
});

userSchema.pre("save", async function (next) {
  this.confirmPassword = undefined;
  this.password = await bcrypt.hash(this.password, 5);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
