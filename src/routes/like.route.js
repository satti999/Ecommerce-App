import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const likeRouter = Router();
likeRouter.use(verifyJWT);

likeRouter.route("/toggle/v/:videoId").post(toggleVideoLike);

likeRouter.route("/toggle/c/:commentId").post(toggleCommentLike);

likeRouter.route("/toggle/t/:tweetId").post(toggleTweetLike);

likeRouter.route("/videos").get(getLikedVideos);

export {likeRouter} ;