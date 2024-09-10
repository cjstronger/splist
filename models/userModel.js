const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: "A password is required",
    select: false,
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
    unique: [true, "email already in use"],
  },
  name: {
    type: String,
    max: [100, "The max length of your name is 100 characters"],
  },
  role: {
    type: String,
    default: "user",
    select: false,
  },
  platforms: {
    type: [String],
  },
});

userSchema.pre("save", async function (next) {
  this.confirmPassword = undefined;
  this.password = await bcrypt.hash(this.password, 5);
  next();
});

userSchema.method("verify", async function (attemptedPW, encryptedPW) {
  const comparison = await bcrypt.compare(attemptedPW, encryptedPW);
  return comparison;
});

userSchema.method("generateToken", function (id) {
  const token = jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
