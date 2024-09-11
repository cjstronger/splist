const express = require("express");
const viewsController = require("../../controllers/viewsController");

const viewsRouter = express.Router();

viewsRouter.get("/", viewsController.getHome);

module.exports = viewsRouter;
