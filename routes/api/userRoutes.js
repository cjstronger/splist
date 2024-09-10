const express = require("express");
const userController = require("../../controllers/userControllers");
const authController = require("../../controllers/authControllers");

const userRouter = express.Router();

userRouter.get("/me", authController.verify, userController.getMe);

module.exports = userRouter;
