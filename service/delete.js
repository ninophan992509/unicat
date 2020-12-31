const fs = require("fs");
module.exports = (filename) => {
  fs.stat(filename, function (err, stats) {
    if (err) {
      return console.error(err);
    }
    fs.unlink(filename, function (err) {
      if (err) return console.log(err);
      console.log("File deleted successfully");
    });
  });
};
