
// db.js
const connectionString='mongodb://localhost:27017/Blog';
import mongoose from 'mongoose';


const connectToMongoDB = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(connectionString, {
        
      })
        .then(() => {
          console.log('Connected to MongoDB');
          resolve();
        })
        .catch((error) => {
          console.error('MongoDB connection error:', error.message);
          reject(error);
        });
    });
  };
  
  export { connectToMongoDB };