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

const app = express();

app.use(
  cors({
    origin: ["https://splist-self.vercel.app/"],
    methods: ["POST", "GET"],
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
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(cookieParser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/playlists", playlistRouter);

app.use("/", viewsRouter);

app.use((err, req, res, next) => {
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

module.exports = app;
