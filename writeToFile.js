const fs = require('fs');

function writeToFile(file, text){
  return fs.writeFile(file, text, function(err) {});
}

module.exports = writeToFile;
