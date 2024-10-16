const express = require("express");
const viewsController = require("../../controllers/viewsController");
const playlistController = require("../../controllers/playlistControllers");
const authController = require("../../controllers/authControllers");

const viewsRouter = express.Router();

viewsRouter.use(authController.isLoggedIn);

viewsRouter.get("/welcome", viewsController.getWelcome);
viewsRouter.get("/", authController.verify, viewsController.getHome);
viewsRouter.get("/login", viewsController.getLogin);
viewsRouter.get("/reset-password/:token", viewsController.getResetPassword);
viewsRouter.get(
  "/spotify-login",
  authController.verify,
  authController.spotifyRedirect
);

viewsRouter.get("/error", viewsController.getError);

viewsRouter.use(authController.protect);

viewsRouter.get("/thank-you", viewsController.getThankYou);

viewsRouter.get(
  "/playlists",
  authController.verify,
  playlistController.getPlaylists,
  viewsController.getPlaylists
);
viewsRouter.get(
  "/playlists/:name",
  authController.verify,
  playlistController.getPlaylist,
  viewsController.getPlaylist
);

module.exports = viewsRouter;
