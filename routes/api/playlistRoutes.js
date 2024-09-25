const express = require("express");
const playlistController = require("../../controllers/playlistControllers");
const authController = require("../../controllers/authControllers");

const playlistRouter = express.Router();

playlistRouter.use(authController.verify);

playlistRouter.post("/generate", playlistController.generatePlaylist);

playlistRouter.post("/create", playlistController.createPlaylist);

module.exports = playlistRouter;
