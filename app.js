const express = require("express");
const authRouter = require("./routes/api/authRoutes");

const app = express();

app.route(authRouter, "/api/auth");

module.exports = app;
