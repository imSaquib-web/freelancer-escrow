import express from "express";
import userController from "../Controller/User.controller.js";
import {protect} from '../Middleware/auth.js'

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", protect, userController.getMe);

export default router;
