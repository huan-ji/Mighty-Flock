const AVS = require('alexa-voice-service');
const player = AVS.Player;
const sendAudio = require('./sendAudio.js');
const sendArrayBuffer = require('./sendArrayBuffer.js');
const parseQuery = require('./parseQuery.js')

const W3CWebSocket = require('websocket').w3cwebsocket;
const port = process.env.PORT || 5000;
const client = new W3CWebSocket('wss://localhost:' + port, 'echo-protocol');
const avs = new AVS({
  debug: true,
  clientId: 'amzn1.application-oa2-client.0a53180dc48f463199058cb7f8433818',
  clientSecret: '3c49fc830be462b58b6d02736e97d450d7a6868aa3663c8c0c1de324d2710ed6',
  refreshToken: 'Atzr|IwEBIFlKfVnAgT2MAyI4M2vn602Zrw0LHglpMml5A1OgP_uubu-06-O7zszutK-MLp32ydCR706NVL1g43S-kbKoYOW5zjU_G4kyszKCs-gowxCR7LPVj-Sk6xrok0WicTrLAznTUbv0wQ90M-qhYnAWhSBYjZ_xkomKXnNYY3E1JjGjIP6bn7n2_BMtZVuaQ7ONjBgQGc_1SNfNy6K2PKHY_lqbDVAHf1JCJGoVi_SzNI0ofy-Ls58t_zjkelA0fwfyBo8J5neIruXUY_egqazg88qC9Poxzk1Y4umm11GOg1qm2FilU8zWSqz7QgIrMgquHtPEeXhQiVBNa4s1dtGcSb9gDUa3Mnp7PyuBKRgR2JiPaZpKJKZdmyDjw1kUxtB7fmQ1yCBfbP7pnzu-TgxmzztpPWUw5LBly-vC9nIztd259jRLcUZrj85Us-rrQecWj31fmjSg1C1rTmQ5oZjZugAYFGte3o_PMxAFy4UhQTLa0IKBqd0Z_rxMsfFpZ92hDX5PnVat1vpSKFqaY8zp9sWgdxn_PVZuQN0PF6csYXdrFQ',
  deviceId: 'mighty_flock_device',
  deviceSerialNumber: 123,
  redirectUri: `https://localhost:${port}/authresponse`
});
window.avs = avs;

var flockArrayBuffer;
var fileReader  = new FileReader;
fileReader.onload = function () {
  flockArrayBuffer = this.result;
}

var xhr = new XMLHttpRequest();
xhr.open('GET', `https://localhost:${port}/mp3`, true);
xhr.responseType = 'blob';
xhr.onload = function(e) {
  if (this.status == 200) {
    var myBlob = this.response;
    fileReader.readAsArrayBuffer(myBlob);
  }
};
xhr.send();

avs.on(AVS.EventTypes.TOKEN_SET, () => {
  // loginBtn.disabled = true;
  // logoutBtn.disabled = false;
  startRecording.disabled = false;
  stopRecording.disabled = true;
});

avs.on(AVS.EventTypes.RECORD_START, () => {
  startRecording.disabled = true;
  stopRecording.disabled = false;
});

avs.on(AVS.EventTypes.RECORD_STOP, () => {
  startRecording.disabled = false;
  stopRecording.disabled = true;
});

// avs.on(AVS.EventTypes.LOGOUT, () => {
//   loginBtn.disabled = false;
//   logoutBtn.disabled = true;
//   startRecording.disabled = true;
//   stopRecording.disabled = true;
// });

avs.on(AVS.EventTypes.TOKEN_INVALID, () => {
  avs.logout()
  .then(login)
});

avs.on(AVS.EventTypes.LOG, log);
avs.on(AVS.EventTypes.ERROR, logError);

avs.player.on(AVS.Player.EventTypes.LOG, log);
avs.player.on(AVS.Player.EventTypes.ERROR, logError);

avs.player.on(AVS.Player.EventTypes.PLAY, () => {
  playAudio.disabled = true;
  replayAudio.disabled = true;
  pauseAudio.disabled = false;
  stopAudio.disabled = false;
});

avs.player.on(AVS.Player.EventTypes.ENDED, () => {
  playAudio.disabled = true;
  replayAudio.disabled = false;
  pauseAudio.disabled = true;
  stopAudio.disabled = true;
});

avs.player.on(AVS.Player.EventTypes.STOP, () => {
  playAudio.disabled = true;
  replayAudio.disabled = false;
  pauseAudio.disabled = false;
  stopAudio.disabled = false;
});

avs.player.on(AVS.Player.EventTypes.PAUSE, () => {
  playAudio.disabled = false;
  replayAudio.disabled = false;
  pauseAudio.disabled = true;
  stopAudio.disabled = true;
});

avs.player.on(AVS.Player.EventTypes.REPLAY, () => {
  playAudio.disabled = true;
  replayAudio.disabled = true;
  pauseAudio.disabled = false;
  stopAudio.disabled = false;
});

function log(message) {
  logOutput.innerHTML = `<li>LOG: ${message}</li>` + logOutput.innerHTML;
}

function logError(error) {
  logOutput.innerHTML = `<li>ERROR: ${error}</li>` + logOutput.innerHTML;
}

function logAudioBlob(blob, message) {
  return new Promise((resolve, reject) => {
    const a = document.createElement('a');
    const aDownload = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    const ext = blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'wav';
    const filename = `${Date.now()}.${ext}`;
    a.href = url;
    a.target = '_blank';
    aDownload.href = url;
    a.textContent = filename;
    aDownload.download = filename;
    aDownload.textContent = `download`;

    audioLogOutput.innerHTML = `<li>${message}: ${a.outerHTML} ${aDownload.outerHTML}</li>` +audioLogOutput.innerHTML;
    resolve(blob);
  });
}

// const loginBtn = document.getElementById('login');
// const logoutBtn = document.getElementById('logout');
const logOutput = document.getElementById('log');
const audioLogOutput = document.getElementById('audioLog');
const startRecording = document.getElementById('startRecording');
const stopRecording = document.getElementById('stopRecording');
const stopAudio = document.getElementById('stopAudio');
const pauseAudio = document.getElementById('pauseAudio');
const playAudio = document.getElementById('playAudio');
const replayAudio = document.getElementById('replayAudio');

// If using client secret
// avs.getCodeFromUrl()
//   .then(code => avs.getTokenFromCode(code))
//   .then(token => localStorage.setItem('token', token))
//   .then(refreshToken => localStorage.setItem('refreshToken', refreshToken))
//   .then(() => avs.requestMic())
//   .then(() => avs.refreshToken())
//   .catch(() => {});

// avs.getTokenFromUrl()
// .then(() => avs.getToken())
// .then(token => localStorage.setItem('token', token))
// .then(() => avs.requestMic())
// .catch(() => {
//   const cachedToken = localStorage.getItem('token');
//
//   if (cachedToken) {
//     avs.setToken(cachedToken);
//     return avs.requestMic();
//   }
// });

avs.refreshToken()
.then(() => avs.requestMic())
.catch(() => {});

// loginBtn.addEventListener('click', login);

function login(event) {
  // return avs.login()
  // .then(() => avs.requestMic())
  // .catch(() => {});

  // If using client secret
  avs.login({responseType: 'code'})
    .then(() => avs.requestMic())
    .catch(() => {});
}

// logoutBtn.addEventListener('click', logout);
function logout() {
  return avs.logout()
  .then(() => {
    localStorage.removeItem('token');
      window.location.hash = '';
    });
}

startRecording.addEventListener('click', () => {
  avs.startRecording();
});

stopRecording.addEventListener('click', () => {
  avs.stopRecording().then(dataView => {
    avs.player.emptyQueue()
    .then(() => avs.audioToBlob(dataView))
    .then(blob => logAudioBlob(blob, 'VOICE'))
    .then(() => avs.player.enqueue(dataView))
    .then(() => avs.player.play())
    .catch(error => {
      console.error(error);
    });

        var ab = false;
    //sendBlob(blob);
    sendAudio(dataView)
  });
});

stopAudio.addEventListener('click', (event) => {
  avs.player.stop();
});

pauseAudio.addEventListener('click', (event) => {
  avs.player.pause();
});

playAudio.addEventListener('click', (event) => {
  avs.player.play();
});

replayAudio.addEventListener('click', (event) => {
  avs.player.replay();
});

function sendBlob(blob) {
  const xhr = new XMLHttpRequest();
  const fd = new FormData();

  fd.append('fname', 'audio.wav');
  fd.append('data', blob);

  xhr.open('POST', 'http://localhost:5555/audio', true);
  xhr.responseType = 'blob';

  xhr.onload = (event) => {
    if (xhr.status == 200) {
      console.log(xhr.response);
      //const responseBlob = new Blob([xhr.response], {type: 'audio/mp3'});
    }
  };

  xhr.send(fd);
}

client.onerror = function() {
  console.log('Connection Error');
};

client.onopen = function() {
  console.log('WebSocket Client Connected');
  const queryParams = parseQuery(window.location.search);

  client.send(queryParams.flockEvent);
};

client.onclose = function() {
  console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
  if (e.data === 'notification') {
    sendAudio(new DataView(flockArrayBuffer));
  }
};
