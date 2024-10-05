const cloudinary = require("cloudinary").v2;
const bufferToStream = require("./buffer"); // Assuming the utility is in the same folder

// Helper function to upload from buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result.secure_url);
    });

    bufferToStream(buffer).pipe(uploadStream);  // Use bufferToStream here
  });
};
 
module.exports = uploadToCloudinary;

