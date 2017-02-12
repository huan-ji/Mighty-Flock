const flock = require('flockos');
const store = require('./store');
const writeToFile = require('./writeToFile.js');

var webhook = function (event) {
  let mentions = '';

  if (event.mentions) {
    mentions = event.mentions.map(id => store.getUserInfo(id).userName);
  }
  const from = store.getUserInfo(event.from).userName;
  const to = "Lobby";
  let message = '';

  const mentionText = mentions.length ? `while mentioning ${mentions.join(' and ')}` : ''
  message += `${from} said to ${to} ${mentionText}: ${event.text}`

  writeToFile('alexa.txt', message);

  const userInfos = store.getUserInfos();
  console.log(userInfos)
  Object.keys(userInfos).forEach(function (userId) {
    let userInfo = userInfos[userId];
    console.log(userInfo)
    userInfo.wsconnection.sendUTF('notification');
  });
}

module.exports = webhook;
