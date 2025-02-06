const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "file/"); // Path where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname); // Unique file name
  },
});

const upload = multer({storage: storage});

module.exports = upload;
