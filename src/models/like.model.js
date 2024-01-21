import monogoose, {Schema} from "mongoose";

const likeSchemma = new Schema(
    {
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        }
    },
    {
        timestamps:true
    }
)
export const Like= monogoose.model("Like",likeSchemma)