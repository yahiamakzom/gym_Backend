const cloudinary = require("cloudinary").v2;
const bufferToStream = require("./buffer"); // Assuming the utility is in the same folder

// Helper function to upload from buffer to Cloudinary
const uploadToCloudinary = (buffer, fileType = "image") => {
  // Set the resource type and folder based on fileType
  let resourceType = "image"; // Default resource type
  let folder = "images"; // Default folder

  if (fileType === "video") {
    resourceType = "video";
    folder = "videos";
  } else if (fileType === "pdf") {
    resourceType = "raw";
    folder = "pdfs"; // Folder for PDFs
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType, // Adjust resource type based on fileType
        folder: folder,
        timeout: 320000,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    bufferToStream(buffer).pipe(uploadStream); // Use bufferToStream here
  });
};

module.exports = uploadToCloudinary;
