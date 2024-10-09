const express = require("express");
const authController = require("../../controllers/authControllers");

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/signup", authController.signUp, authController.login);
authRouter.post("/forgot-password", authController.sendResetEmail);
authRouter.patch("/reset-password/:token", authController.resetPassword);

authRouter.get("/spotify", authController.spotifyRedirect);
authRouter.get("/logged-in-spotify", authController.spotifyLoggedIn);

authRouter
  .route("/callback")
  .get(authController.verify, authController.spotifyCallback);

module.exports = authRouter;
