const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/students/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//maximum size 5MB
const maxSize = 5 * 1000 * 1000;

module.exports = multer({
  storage,
  limits: { fileSize: maxSize },
});
