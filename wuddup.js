const flock = require('flockos');
const store = require('./store');

var wuddup = function (event, callback) {
  // callback(null, { text: 'Received your command' });
  flock.callMethod('chat.sendMessage', store.getUserToken(event.userId), {
      to: event.chat,
      text: "wuddup",
  }, (error, response) => {
      if (!error) {
          console.log(response);
      } else {
          console.log("error");
      }
  });
}

module.exports = wuddup;
