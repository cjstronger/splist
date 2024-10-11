const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: "A password is required",
    select: false,
    min: 8,
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
    unique: [true, "Email already in use"],
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
  resetToken: String,
  resetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.method("verify", async function (attemptedPW, encryptedPW) {
  const comparison = await bcrypt.compare(attemptedPW, encryptedPW);
  return comparison;
});

userSchema.method("generateToken", function (id, res) {
  const token = jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  let cookieOptions = {
    expires: Date.now() + process.env.JWT_COOKIES_EXPIRES * 1000 * 60 * 60 * 24,
    httpOnly: true,
  };

  if (process.env.MODE === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  return token;
});

userSchema.method("generateResetToken", function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const encryptedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest();

  this.resetToken = encryptedToken;
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
