const express = require("express");
const authRouter = require("./routes/api/authRoutes");
const viewsRouter = require("./routes/react/viewRoutes");
const playlistRouter = require("./routes/api/playlistRoutes");
const handleOpErrors = require("./utils/handleOpErrors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/api/userRoutes");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.use(
  cors({
    origin: ["https://spli.st", "https://www.spli.st"],
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        scriptSrc: ["'self'", "https:", "http:", "blob:"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "blob:",
          "https://*.spotify.com",
          "https://bundle.js:*",
          "ws://127.0.0.1:*/",
          "https://i.scdn.co/image/*",
          "wss://*.herokuapp.com:*/",
          "https://spli.st/*",
          "https://www.spli.st/*",
          "wss://ws-us3.pusher.com",
        ],
        mediaSrc: ["'self'", "https:", "http:"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/playlists", playlistRouter);

app.use("/", viewsRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  if (err.name === "ValidationError") {
    handleOpErrors.validationError(error);
  }
  if (
    err.name === "SyntaxError" ||
    err.name === "TypeError" ||
    err.name === "ReferenceError"
  ) {
    handleOpErrors.syntaxError(error);
  }
  if (err.code === 11000) {
    handleOpErrors.duplicateError(error);
  }
  const spotifyError = err.response?.data.error;
  if (spotifyError && spotifyError.status === 401) {
    handleOpErrors.spotifyAuthError(error);
  }

  res.error = error;

  if (
    req.originalUrl.startsWith("/api") &&
    !req.originalUrl.includes("callback?code=")
  ) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message || err.message,
    });
  }

  res.redirect(
    `/error?status=${error.status}&message=${encodeURIComponent(
      error.message || err.message
    )}`
  );
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

connectDB();

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  console.error("Stack Trace:", reason.stack);
  // Optionally, you can exit the process if needed
  // process.exit(1);
});

module.exports = app;
