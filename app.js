const express = require("express");
const authRouter = require("./routes/api/authRoutes");
const handleOpErrors = require("./utils/handleOpErrors");

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let error = { ...err };
  if (err.name === "ValidationError") {
    handleOpErrors.validationError(error);
  }

  return res.status(error.statusCode).json({
    status: "fail",
    message: error.message,
  });
});

module.exports = app;
