const express = require("express");
const playlistController = require("../../controllers/playlistControllers");
const authController = require("../../controllers/authControllers");

const playlistRouter = express.Router();

playlistRouter.post(
  "/generate",
  authController.verify,
  playlistController.generatePlaylist
);

module.exports = playlistRouter;
