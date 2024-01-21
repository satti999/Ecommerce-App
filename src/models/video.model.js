import monogoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
     videoFile: {
        public_id:{
            type: String, //cloudinary url
            //required: true
        },
        url:{
            type:String,
            required:[true,"videoFile url is required"]
        }
        
    },
    thumbnail: {
        public_id:{
            type: String, //cloudinary url
            //required: true
        },
        url:{
            type:String,
            required:[true,"videoFile url is required"]
        }
    },
    title: {
        type: String, 
       // required: true
    },
    description: {
        type: String, 
       // required: true
    },
    duration: {
        type: Number, 
       // required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


},
    {
        timestamps:true

    }
)


videoSchema.plugin(mongooseAggregatePaginate)
export const Video = monogoose.model("Video",videoSchema)