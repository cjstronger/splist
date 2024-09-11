const express = require("express");
const authRouter = require("./routes/api/authRoutes");
const viewsRouter = require("./routes/react/viewRoutes");
const handleOpErrors = require("./utils/handleOpErrors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/api/userRoutes");
const path = require("path");
const reactViews = require("express-react-views");

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jsx");
app.engine("jsx", reactViews.createEngine());

app.use(express.static(path.join(__dirname, "public")));

if (process.env.MODE === "development") {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
} else {
  app.use("/", viewsRouter);
}

app.use((err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  if (err.name === "ValidationError") {
    handleOpErrors.validationError(error);
  }
  if (err.name === "SyntaxError") {
    handleOpErrors.syntaxError(error);
  }
  if (err.code === 11000) {
    handleOpErrors.duplicateError(error);
  }

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message || err.message,
  });
});

module.exports = app;
