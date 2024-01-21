import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";


const tweetRouter = Router();
tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(createTweet);

tweetRouter.route("/user/:userId").get(getUserTweets);

tweetRouter.route("/tweet/:tweetId").patch(updateTweet).delete(deleteTweet);

export {tweetRouter} ;