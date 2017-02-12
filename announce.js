const flock = require('flockos');
const store = require('./store');
const writeToFile = require('./writeToFile.js');

var announce = function (event, clients) {
  writeToFile('alexa.txt', event.text);
  for (var i in clients) {
    // Send a message to the client with the message
    clients[i].sendUTF('notification');
  }
}

module.exports = announce;
