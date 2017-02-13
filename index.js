const AVS = require('alexa-voice-service');
const player = AVS.Player;
const sendAudio = require('./sendAudio.js');
const sendArrayBuffer = require('./sendArrayBuffer.js');
const parseQuery = require('./parseQuery.js')

const W3CWebSocket = require('websocket').w3cwebsocket;
const port = process.env.PORT || 5000;
const client = new W3CWebSocket('ws://localhost:' + port, 'echo-protocol');
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
  startStopRecording.disabled = false;
});

avs.player.on(AVS.Player.EventTypes.PLAY, () => {
});

avs.player.on(AVS.Player.EventTypes.ENDED, () => {
});

avs.player.on(AVS.Player.EventTypes.STOP, () => {
});

avs.player.on(AVS.Player.EventTypes.PAUSE, () => {
});

avs.player.on(AVS.Player.EventTypes.REPLAY, () => {
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

const startStopRecording = document.getElementById('startStopRecording')

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

startStopRecording.addEventListener('mousedown', () => {
  avs.startRecording();
});

startStopRecording.addEventListener('mouseup', () => {
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
