import {asyncHandler} from "../utils/asyncHandler.js";
import{User} from "../models/user.model.js";
import{ ApiError} from "../utils/ApiError.js";
import{ ApiResponse} from "../utils/ApiResponse.js"
import{uploadOnCloudinary} from "../utils/cloudinary.js";
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId)=>{
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken =refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500," Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async(req,res)=>{
    // get user detils from frontend
    // validate that user is not empty
    // check if user already exists like username or email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // remove password and refresh token field from response
    // check for user  creation
    // return response

    console.log("register user");
    const{ fullName, email, username, password}= req.body

    if(
        [fullName,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")

    }
    const existedUser = await User.findOne({
        $or: [{username},{email}],
        
    })
    if(existedUser){
        console.log("existing user : ",existedUser)
        throw new ApiError(409," User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("Avatar local path",avatarLocalPath)
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let  coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log("Cover Image local path",coverImageLocalPath)
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is not uploaded on cloudinary ")
    }

    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

    })


const loginUser = asyncHandler(async (req, res)=>{
    // req body -> data
    // username or email
    // find the user
    //password check 
    // access and refresh token
    // send cookie

    const { email, username, password}= req.body
    console.log(email);

    //if(!(username && email)){
      //  throw new ApiError(400, "username or email is required ")

   //
 //}
    const user= await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }
   const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly:true,
    secure:true
   }

   return res.status(200)
   .cookie("accessToken", accessToken,options)
   .cookie("refreshToken", refreshToken,options)
   .json(
    new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },
    "user logged in Successfully")
   )
   



})
const loggoutUser = asyncHandler(async(req,res)=>{

    console.log("Logout user")
    await User.findByIdAndUpdate(req.user_id,
        {
            $unset:{
                refreshToken:1,
            },
            
        },
        {
            new:true
        })

        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200).clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")

    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user = User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"Invalid refresh token")
     }
 
     if(incomingRefreshToken!==user?._id)
     {
         throw new ApiError(401,"Refresh token is expired or used")
     }
     options={
         httpOnly:true,
         secure: true
     }
         const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
         return res.status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newRefreshToken,Options)
         .json(
             new ApiResponse(200,
                 { accessToken,refreshToken:newRefreshToken},
                 "Access token refreshed")
         )
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreh token")
   }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword}= req.body
    const user = await User.findById(req.user._id)
    const isPasswordCorrectRight = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrectRight){
        throw new ApiError(400, "Invalid old Password")
    }
    user.password= newPassword
     await user.save({
        validateBeforeSave:false
    })
    return res.status(200).
    json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(200,req.user,"Current user fetch successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!(fullName || email)){
        return new ApiError(400, "All fields are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new :true}
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updatedUserAvatar =asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
        
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url)
    {
        throw new ApiError(400,"Error while uploading avatar")
    }
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
         $set:{
            avatar:avatar.url
         }
        },
        {
            new:true
        }
    ).select("-password")
  
    return res.status(200).json(new ApiResponse(
        200,user,"Avatar image is updated successfully"
    ))



})


const updatedUserCoverImage =asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "Avatar file is missing")
        
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url)
    {
        throw new ApiError(400,"Error while uploading coverImage")
    }
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
         $set:{
            coverImage:coverImage.url
         }
        },
        {
            new:true
        }
    ).select("-password")
  
    return res.status(200).json(new ApiResponse(
        200,user,"Cover image is updated successfully"
    ))

    

})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
  const {username} = req.params //it use get data from from link
    if(!username?.trim()){
      throw new ApiError(400,"Username is missing")
    }
    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
            
        },
        {
            $lookup:{
                from:"subsciptions",
                localField:"_id",
                foreignField:"channel",
                as:"subsribers"
            }
        },
        {
            $lookup:{
                from:"subsciptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subcribersCount:{
                    $size:"$subsribers"
                },
                channelSubscribedToCount:{
                    $size:"subscribedTo"
                },
                isSubcribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subsribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subcribersCount:1,
                channelSubscribedToCount:1,
                isSubcribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exits")
    }

    return res.status(200)
    .json(new ApiResponse(200,channel[0],"User channel fetched successfully"))



})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"onwer",
                            foreignField:"_id",
                            as:"watchHistory",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory)
    )
})
export {
    registerUser,loggoutUser,loginUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,updateAccountDetails,
    updatedUserAvatar,updatedUserCoverImage,getUserChannelProfile,
    getWatchHistory
}
