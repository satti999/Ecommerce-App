import  {Router} from "express";
import {registerController} from "../controllers/authController.js";

const userRouter =Router()
console.log("wrking2")
userRouter.route("/register").post(registerController)



export { 
    userRouter,
}