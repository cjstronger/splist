const catchAsync = require("../utils/catchAsync");

exports.getMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  res.status(200).json({
    data: req.body.user,
  });
});
