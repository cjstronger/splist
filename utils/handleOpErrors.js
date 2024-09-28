const AppError = require("./AppError");

exports.validationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input detected: ${errors.join(". ")}`;
  error.message = message;
  return new AppError(message, 400);
};

exports.syntaxError = (error) => {
  const message = "An error has occured within the api, try again later";
  error.message = message;
  return new AppError(message, 400);
};

exports.duplicateError = (error) => {
  const key = Object.keys(error.keyPattern)[0];
  const message = `The ${key} '${error.keyValue[key]}' is already in use`;
  error.message = message;
  return new AppError(message, 409);
};
