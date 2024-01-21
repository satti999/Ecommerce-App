import { Video } from "../models/video.model.js";
import { Comment } from "../modelsByMe/comment.modelsByMe.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";


const addComment = asyncHandler(async (req, res) => {
    // Steps to add comment
    // take comment content from req.body
    // take videoId on which to comment from req.params
    // find video using videoId
    // validate video (means if exists)
    // No need to find comment like you find likes bcz you can have multiple comment
    // create comment
    // validate it
    // response
  
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
  
    if (!videoId || !content) {
      throw new ApiError(400, "All fields are required");
    }
  
    if (!isValidObjectId(videoId) || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid object id");
    }
  
    const video = await Video.findById(videoId);
  
    if (!video) {
      throw new ApiError(404, "video not found");
    }
  
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });
  
    if (!comment) {
      throw new ApiError(400, "Error while uploading comment");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment created successfully"));
  });
  const updateComment = asyncHandler(async (req, res) => {
    // Steps to update comment
    // take comment id from req.params
    // take updated content from req.body
    // validate comment id using isValidObjectId
    // use findByIdAndUpdate() method to update comment
    // response
  
    const { commentId } = req.params;
    const { content } = req.body;
  
    if (!commentId || !content) {
      throw new ApiError(400, "All fields are required");
    }
  
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }
  
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );
  
    if (!comment) {
      throw new ApiError(404, "comment not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment updated successfully"));
  });
  const deleteComment = asyncHandler(async (req, res) => {
    // Steps to delete comment
    // take comment id from req.params
    // validate it
    // use findByIdAndDelete() method to delete comment
    // response
  
    const { commentId } = req.params;
  
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }
  
    const comment = await Comment.findByIdAndDelete(commentId);
  
    if (!comment) {
      throw new ApiError(400, "comment not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment deleted successfully"));
  });
  const getVideoComments = asyncHandler(async (req, res) => {
    // Steps to get all video comments
    // take videoId from req.params
    // take queries from req.query
    // use mongoose exists() to check if video exists
    // Now, define mongodb aggregation pipeline
    // Use them in function called with
    // modelName.aggregatePaginate(pipelineDefineAbove, {page, limit})
    // options = {page,limit}
  
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }
  
    const isVideoExists = await Video.findById(videoId);
  
    if (!isVideoExists) {
      throw new ApiError(404, "video not found");
    }
  
    const options = {
      page,
      limit,
    };
  
    const aggregationPipeline = Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
  
    const results = await Comment.aggregatePaginate(aggregationPipeline, options);
  
    if (results.totalDocs === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "video has no comments"));
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, results, "comments fetched successfully"));
  });
  
  export { addComment, updateComment, deleteComment, getVideoComments };