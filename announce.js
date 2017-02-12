const flock = require('flockos');
const store = require('./store');
const writeToFile = require('./writeToFile.js');

var announce = function (event) {
  writeToFile('alexa.txt', event.text);

  const userInfos = store.getUserInfos();
  console.log(userInfos)
  Object.keys(userInfos).forEach(function (userId) {
    let userInfo = userInfos[userId];
    console.log(userInfo)
    userInfo.wsconnection.sendUTF('notification');
  });
}

module.exports = announce;
