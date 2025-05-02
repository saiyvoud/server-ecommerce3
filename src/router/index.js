import express from "express";
import UserController from "../controller/user.js";
const router = express.Router();
router.post("/user/register",UserController.Register);
export default router;