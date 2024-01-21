import monogoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subsribing
        ref: "User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    

},
{
    timestamps:true
});

export const Subscription = monogoose. model("Subscription",subscriptionSchema)


