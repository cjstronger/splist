const catchAsync = require("../utils/catchAsync");
const OpenAI = require("openai");

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    data: res.user,
  });
});
