const AppError = require("./AppError");

exports.syntaxError = (error) => {
  const message = "A server side error has occurred, please try again later";
  error.message = message;
  return new AppError(message, 400);
};

exports.validationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input detected: ${errors.join(". ")}`;
  error.message = message;
  return new AppError(message, 400);
};

exports.duplicateError = (error) => {
  const key = Object.keys(error.keyPattern)[0];
  const message = `The ${key} '${error.keyValue[key]}' is already in use`;
  error.message = message;
  return new AppError(message, 409);
};

exports.spotifyAuthError = (error) => {
  const message =
    "You are not logged in with Spotify or your session has expired, please login again";
  error.message = message;
  return new AppError(message, 401);
};
