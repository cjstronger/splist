const express = require("express");
const authController = require("../../controllers/authControllers");

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/signup", authController.signUp, authController.login);

authRouter.get("/spotify", authController.spotifyRedirect);

authRouter.route("/callback").get(authController.spotifyCallback);

module.exports = authRouter;
