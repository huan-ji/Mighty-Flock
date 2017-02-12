const fs = require('fs');

function readFile(file, callback) {
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    callback(data);
  });
}

module.exports = readFile;
