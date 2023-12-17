
// app.js

import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import {connectToMongoDB} from "./src/db/index.js"
import {userRouter} from "./src/routes/authRoute.js"
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(morgan('dev'));

// Routes
console.log("wrking")
app.use("api/v1/", userRouter)
console.log("wrking1")
// Define routes
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the e-commerce app</h1>');
});

// Port configuration
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

