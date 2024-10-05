const express = require("express");
const viewsController = require("../../controllers/viewsController");
const playlistController = require("../../controllers/playlistControllers");
const authController = require("../../controllers/authControllers");

const viewsRouter = express.Router();

viewsRouter.get("/", viewsController.getHome);
viewsRouter.get("/login", viewsController.getLogin);
viewsRouter.get("/spotify-login", viewsController.getSpotify);
viewsRouter.get(
  "/playlists",
  authController.verify,
  playlistController.getPlaylists,
  viewsController.getPlaylists
);
viewsRouter.get(
  "/playlists/:name",
  playlistController.getPlaylist,
  viewsController.getPlaylist
);
viewsRouter.get("/error", viewsController.getError);

module.exports = viewsRouter;
