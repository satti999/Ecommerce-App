import  {Router} from "express";

import{registerUser,loginUser,loggoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updatedUserAvatar, updatedUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import{verifyJWT} from "../middlewares/auth.middleware.js";
const userRouter =Router()



userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1 
        }
    ]

    ),
    registerUser)

userRouter.route("/login").post(loginUser)
// secure Route
userRouter.route("/logout").post(verifyJWT, loggoutUser)

userRouter.route("/refresh_token").post(verifyJWT,refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT,updateAccountDetails)
userRouter.route("/avatar").patch(verifyJWT,upload.single("avatar"),updatedUserAvatar)
userRouter.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updatedUserCoverImage)
userRouter.route("/c/:username").get(verifyJWT,getUserChannelProfile)
userRouter.route("/history").get(verifyJWT,getWatchHistory)

export { 
    userRouter,
}