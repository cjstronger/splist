const crypto = require("crypto");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(async (req, res) => {
  //1) get the un/pw - done
  const { email, password, confirmPassword } = req.body;
  //2) salt the pw in a pre middleware - done
  //3) create a new user with the User model
  const user = await User.create({
    password,
    email,
    confirmPassword,
  });

  res.status(200).json({ status: "success", data: { user } });
});

exports.hello = (req, res) => {
  res.status(200).json({ data: "hello" });
};

exports.login = (req, res) => {
  //1)hash the password
  //2)compare the database password with the attempted login
  //3)generate token
  //4)attach token to cookies
  //5)get token from cookies
  //6)check if token has been altered from the transition to the database
  res.status("201").json({
    status: "success",
    data: {
      user: "User",
    },
  });
};
