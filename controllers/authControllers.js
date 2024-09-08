const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

exports.signUp = catchAsync(async function (req, res, next) {
  const { email, password, confirmPassword, name } = req.body;
  const user = await User.create({
    password,
    email,
    confirmPassword,
    name,
  });

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("An email and password is required", 401));
  const user = await User.findOne({ email }).select("+password");
  const verifiedUser = await user.verify(req.body.password, user.password);
  if (!verifiedUser)
    return next(new AppError("The email or password is incorrect", 401));

  user.password = undefined;

  const token = user.generateToken(user._id);
  const cookieOptions = {
    expires: Date.now() + process.env.JWT_COOKIES_EXPIRES * 1000 * 60 * 60 * 24,
    httpOnly: true,
    //ADD when in production the secure option is set to true
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});
