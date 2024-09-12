const express = require("express");
const viewsController = require("../../controllers/viewsController");

const viewsRouter = express.Router();

viewsRouter.get("/", viewsController.getHome);
viewsRouter.get("/login", viewsController.getLogin);
viewsRouter.get("/spotify-login", viewsController.getSpotify);

module.exports = viewsRouter;
