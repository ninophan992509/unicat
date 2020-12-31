const fs = require("fs");
const request = require("request");

module.exports = (uri, filename, callback) => {
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};
