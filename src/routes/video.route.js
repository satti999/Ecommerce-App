import  {Router} from "express";

import { upload } from "../middlewares/multer.middleware.js";
import{verifyJWT} from "../middlewares/auth.middleware.js";
import{publishAVideo,getVideoById,deletedVideo, updateVideoThumbnail}from "../controllers/video.controller.js"

const videoRouter =Router()


videoRouter.use(verifyJWT);

//videoRouter.route("/:videoId").get((req,res)=>
// {console.log("Hello"); res.send("Hello")});

// videoRouter
//     .route("/")
//     .get();

videoRouter.route("/upload-video").post(verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo)
videoRouter.route("/:videoId").get(getVideoById)
videoRouter.route("/delete-video/:videoId").delete(verifyJWT,deletedVideo)
//router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo)
//videoRouter.route("update-thumbnail/:videoId").patch(verifyJWT,updateVideoThumbnail)
videoRouter.route("/update-video-thumbnail/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoThumbnail);


export{
    videoRouter
} 