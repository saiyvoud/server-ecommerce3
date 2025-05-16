import express from "express";
import UserController from "../controller/user.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
//----- user -----
router.post("/user/register",UserController.Register);
router.post("/user/login",UserController.Login);
router.get("/user/selAll",auth,UserController.SelectAll);
router.get("/user/selOne",auth,UserController.SelectOne);
router.put("/user/forgot",UserController.ForgotPassword);
router.put("/user/changePassword",auth,UserController.ChanagePassword);
router.put("/user/updateProfile",auth,UserController.UpdateProfile);
router.put("/user/refresh",UserController.RefreshToken)
router.delete("/user/delete/:user_id",auth,UserController.DeleteUserOne)
export default router;