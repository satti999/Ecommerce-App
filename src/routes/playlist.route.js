import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route("/:videoId").post(createPlaylist);

playlistRouter.route("/user/:userId").get(getUserPlaylists);

playlistRouter
  .route("/:playlistId")
  .get(getPlaylistById)
  .delete(deletePlaylist)
  .patch(updatePlaylist);

playlistRouter.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
playlistRouter.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);

export {playlistRouter} ;
