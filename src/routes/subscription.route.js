import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscriber,
  toggleSubscription,
} from "../controllers/subscriber.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter
  .route("/c/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscriber);

  subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);

export {subscriptionRouter} ;