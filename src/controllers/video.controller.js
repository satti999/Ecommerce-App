import mongoose,{isValidObjectId} from "mongoose"; 
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import{Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { upload } from './../middlewares/multer.middleware.js';



const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query;
  if(!isValidObjectId(userId)){
    throw new ApiError(400,"Invalid user id")
  }
  if (!query || !sortBy || !sortType) {
    throw new ApiError(404, "All fields are required");
  }

  const userExists= await User.findById(userId)
  if(!userExists){
    throw new ApiError(404,"User not found")
  }

  const options={
    page:parseInt(page),
    limit: parseInt(limit)
  };
   
  let sortOptions ={};
  if(sortBy){
    sortOptions[sortBy]=sortType==="desc"?-1:1;
  }
  const videoAggregationPipeline = Video.aggregate([
    {
        $match:{
            $and:[
                {
                owner: new mongoose.Types.ObjectId(userId)
               },
               {
                title:{
                $regex:query,
                $options:"i",
                },
              }
            ]
          }
        },
        {
            $sort:sortOptions,
        }
  ])

  const resultedVideo= await Video.aggregatePaginate(
    videoAggregationPipeline,
    options
  );

  if(resultedVideo.totalDocs===0){
    return res.status(200).json(
        new ApiResponse(200,{},"user has no videos")
    )
  }
    
    return res.status(200).json(
    new ApiResponse(200,resultedVideo,"videos fetched successfully")
    )
        
 });


const publishAVideo =asyncHandler(async(req,res)=>{
     const {title,description} =req.body
     if([title,description].some((fields)=>fields?.trim()===""))
     {
        throw new ApiError(400,"All fields are required")
     }
     const videoLocalPath=req.files?.videoFile[0]?.path;
     console.log("Avatar local path",videoLocalPath)
     const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
     console.log("Avatar local path",thumbnailLocalPath)
     
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }
    
    const videoPath = await uploadOnCloudinary(videoLocalPath)
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)
    console.log("vedio response",videoPath)
    const vedioDuration=videoPath.duration
 
     const vedio= await Video.create({
        title:title,
        description:description,
        //videoFile: videoPath?.url || "",
       // thumbnail:thumbnailPath?.url || "",
       videoFile:{
        public_id:videoPath.public_id,
        url:videoPath.url

       },
       thumbnail:{
        public_id:thumbnailPath.public_id,
        url:thumbnailPath.url

       },
        duration:vedioDuration,
        isPublished:true,
        owner:req.user._id

     })
     

     const videoUploaded= await Video.findById(vedio._id)
    if(!videoUploaded){
        throw new ApiError(500,"Something went wrong while uploading video")
    }

    return res.status(201).json(
        new ApiResponse(200,videoUploaded,"Vedio uploaded successfully")
    )


})

const getVideoById= asyncHandler(async(req,res)=>{
   // console.log("Hello");
    const {videoId}= req.params;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required or invalid!!");

      
    }
    //const iddd= await Video.findById(videoId)
    
    let video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }

        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                },
                likes:{
                    $size:"$likes"

                },
                views:{
                    $add:[1,"$views"]
                }
            }
        }
    ]);
if(video.length>0){
    video= video[0];
}

  await Video.findByIdAndUpdate(videoId,{
    $set:{
        views:video.views
    }
  });
    res.status(200).json(new ApiResponse(200,video,"The required video is fetched successfully"))

})

const deletedVideo= asyncHandler(async(req,res)=>{
     // steps to delete video
  // take video id from params
  // validate it
  // find video on basis of videoId
  // delete video from cloudinary
  // delete video from database manually
  // response

   const {videoId}= req.params;
   if(!videoId || !isValidObjectId(videoId))
   {
    throw new ApiError(400, "videoId is required or invalid!!");
   }
   const video = await Video.findById(videoId)
   if(!video){
    throw new ApiError(400,"video not found")
   }
   //public_id
   const videoPublicId= video.videoFile.public_id
   const thumbnailPublicId= video.thumbnail.public_id
   const videoFile= await deleteFromCloudinary(
    videoPublicId,
    "video"
   );
   const thumbnailFile= await deleteFromCloudinary(
    thumbnailPublicId,
    "image"
   );
   if(!(videoFile ||thumbnailFile )){
    throw new ApiError(400, "Error while deleting file from cloudinary");
   }
   const deletemsg= await video.deleteOne();
   if(!deletemsg){
    throw new ApiError(400,"Error while deleting video");
   }
   return res.status(200).
   json(new ApiResponse(200,{},"video deleted successfully"));

   
})

const updateVideoDetails=asyncHandler(async(req,res)=>{

      // Steps to update video details
  // take video id from req.params
  // validate it - not empty
  // take video title and description from req.body
  // validate - not empty
  // call findByIdAndUpdate() method
  // validate it
  // response
    const {videoId}= req.params;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required or invalid!!");
    }
    const {title,description}=req.body;
    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const video= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description
            }
        },
        {
        new:true
        }

     )
     if(!video){
        throw new ApiError(400,"Video not found")
     }
  return res .status(200).json(
    new ApiResponse(200,video,"video updated successfully")
  )
});

const updateVideoThumbnail = asyncHandler(async(req,res)=>{
      // Steps to update video thumbnail
  // take video it from req.params
  // validate it
  // take file from system
  // upload to cloudinary
  // find user using id
  // take old thumbnail public_id for deleting
  // update user
  // delete old thumbnail from cloudinary
  // response
    const {videoId}=req.params;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required or invalid!!");
    }
    const thumbnailLocalPath= req.file?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is required");
    }
    const uploadThumbnail= await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadThumbnail.url || !uploadThumbnail.public_id) {
        throw new ApiError(400, "Error while uploading on cloudinary");
    }
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    const oldThumbnailPublicId= video.thumbnail?.public_id;
    if(!oldThumbnailPublicId){
        throw new ApiError(400,"thumbnail public id not found")
    }
    const updateThumbnail= await Video.updateOne(
        {_id:videoId},
        {
            $set:{
                thumbnail:{
                    public_id:uploadThumbnail.public_id,
                    url:uploadThumbnail.url
                }
            }
        }
    );

    if(!updateThumbnail){
        throw new ApiError(400,"Error while updating file");
    }
    const deleteThumbnail = await deleteFromCloudinary(oldThumbnailPublicId);
    if(!deleteThumbnail){
        throw new ApiError(400,"Error while deleting file from cloudinary");
    }
    return res.status(200).
    json(
        new ApiResponse(200, updateThumbnail,"Video thumbnail updated successfully")
    );



});

const togglePublishStatus = asyncHandler(async(req,res)=>{
     // steps to toggle publish status
  // take video id from req.params
  // validate it and find if exists
  // store video.isPublished into variable and apply if condition on it
  // if not exists unpublish it
  // else publish it
  // response
  
  const{videoId}=req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
 const video = await Video.findById(videoId)
 if (!video) {
    throw new ApiError(404, "video not found");
  }
  let videoPublishedStatus= video.isPublished;
  if (!videoPublishedStatus) {
    video.isPublished = true;
  }
   else {
    video.isPublished = false;
  }
  const updatedVideo = await video.save();
  if (!updatedVideo) {
    throw new ApiError(400, "error while updating video");
  }

  return res.status(200).
  json(new ApiResponse(200,updatedVideo,"video is published successfully"))



})


export{
    publishAVideo,getAllVideos,getVideoById,deletedVideo,
    updateVideoDetails,updateVideoThumbnail
}