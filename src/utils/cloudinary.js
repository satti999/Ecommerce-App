import {v2 as cloudinary} from "cloudinary";

import fs from "fs";


cloudinary.config({ 
    cloud_name:'dl8qpluty', 
    api_key: '781576655944811', 
    api_secret:'ZQVlrNtEwqtKINGcg8yBqJLOvJs'
  });

 // G4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ

  //***************************
const uploadOnCloudinary = async (localFilePath)=>{
    try {
      console.log(" local file path",localFilePath)
        //if (!localFilePath) return null
       const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
       })
     // file uploaded successfully

     console.log("file is uploaded on cloundinary",response.url);
     fs.unlinkSync(localFilePath)
     return response;
    } catch (error) {
       fs.unlinkSync(localFilePath)
//remove the locallysaved temporary file as the upload operation got failed.

  console.log("file is not uploaded on cloundinary");
        return null;

   }
}




  export {uploadOnCloudinary}