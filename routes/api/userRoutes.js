const express = require("express");
const userController = require("../../controllers/userControllers");
const authController = require("../../controllers/authControllers");

const userRouter = express.Router();

userRouter.use(authController.verify);

userRouter.get("/me", userController.getMe);

module.exports = userRouter;
