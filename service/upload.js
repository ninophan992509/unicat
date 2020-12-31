const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, "./public/images/students/") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.fieldname + "-" + Date.now()+".jpg") 
    } 
});


//maximum size 2MB
const maxSize = 1 * 1000 * 1000;

module.exports = multer({
        storage,
        limits:{fileSize:maxSize}
});

