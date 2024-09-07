const AppError = require("./AppError");

exports.validationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input detected: ${errors.join(". ")}`;
  error.message = message;
  return new AppError(message, 400);
};
