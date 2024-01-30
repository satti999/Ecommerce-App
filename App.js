
// app.js

import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from "cors"
import cookieParser from "cookie-parser"
import {connectToMongoDB} from "./src/db/index.js"
import {userRouter} from "./src/routes/user.routes.js"
import { videoRouter } from './src/routes/video.route.js';
import{subscriptionRouter} from "./src/routes/subscription.route.js";
import{likeRouter}  from "./src/routes/like.route.js";
import{tweetRouter} from "./src/routes/tweet.route.js"
import{playlistRouter} from "./src/routes/playlist.route.js"
//import {registerController} from "./src/controllers/authController.js"

dotenv.config({
  path:'./.env'
});

// Initialize Express app
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
// Middleware setup
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(morgan('dev'));

// Routes
console.log("wrking")
//app.post("/api/v1/register", registerController)
console.log("wrking1")
// Define routes
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the e-commerce app</h1>');
});
app.use("/api/v1/users", userRouter)
// 
// dusry wala main jo k query params hain us main hum kahin bhi nahi likhty dikhata tujjhy direct req.params sy get karty unhain
// yeh jo hum ny use kya hai isy route params kehtyis main api main likhna hota jesy hum ny likh:id nahi build in khan sy agya 

//app.get("/api/v1/videos/:id", (req,res)=>{console.log("Hello");
 //res.send("Hello")})
  app.use("/api/v1/videos",videoRouter)
  app.use("/api/v1/subscription",subscriptionRouter)
  app.use("/api/v1/like",likeRouter)
  app.use("/api/v1/videos",tweetRouter)
  
  app.use("/api/v1/playlist",playlistRouter)


//app.get("/api/v1/videos", (req, res)=>{console.log(req.query); res.send(req.params)})
// Port configuration or is waly ko req.query.video. Ab tu mery samny apny code ko set kar zra pehly yeh bata k hum konsa params use kar rahy thy? Haan ab bata ab usy set kar na khud mery samny
const PORT = process.env.PORT || 4000;

// Start the server
const startServer = async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server Running on ${process.env.DEV_MODE} ${process.env.PORT}`.cyan);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the application if there's an issue with MongoDB connection
  }
};

startServer();

