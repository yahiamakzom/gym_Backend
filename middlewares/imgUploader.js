// const multer = require('multer');
// const fs = require('fs')

// module.exports = multer({
//     storage: multer.diskStorage({
//         destination: (req, file, cb) => {
//             if (!fs.existsSync('images')) fs.mkdirSync('images')
//             cb(null, 'images')
//         },
//         filename: (req, file, cb) => cb(null, Date.now() + "__" + file.originalname)
//     }), fileFilter: (req, file, cb) => {
//         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (allowedTypes.includes(file.mimetype)) cb(null, true)
//         else cb(new Error('Only image files are allowed'))
//     }
// })

const multer = require("multer");
const fs = require("fs");

// Create directories if they don't exist
const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
};

// Set up multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Create directories for images and documents
      createDirectoryIfNotExists("images");
      createDirectoryIfNotExists("documents");

      // Set destination based on file type
      if (["image/jpeg", "image/png", "image/gif"].includes(file.mimetype)) {
        cb(null, "images");
      } else if (
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.mimetype)
      ) {
        cb(null, "documents");
      } else {
        cb(new Error("Unsupported file type"));
      }
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "__" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const allowedDocumentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      allowedImageTypes.includes(file.mimetype) ||
      allowedDocumentTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image, PDF, and Word files are allowed"));
    }
  },
});

module.exports = upload;
