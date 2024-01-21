import monogoose, {Schema} from "mongoose";

const tweetSchemma = new Schema(
    {
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            require:true
        }
        
    },
    {
        timestamps:true
    }
)
export const Tweet= monogoose.model("Tweet",tweetSchemma)