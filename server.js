const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs');
const request = require('request');
const flock = require('flockos');
const express = require('express');
const store = require('./store');
const bodyParser = require('body-parser');
const cors = require('cors');
const qs = require('qs');
const multer  = require('multer');
const port = 9745;
const upload = multer({ dest: 'uploads/' });
const app = express();
const options = {
  // Private Key
  key: fs.readFileSync('./ssl/server.key'),

  // SSL Certficate
  cert: fs.readFileSync('./ssl/server.crt'),

  // Make sure an error is not emitted on connection when the server certificate verification against the list of supplied CAs fails.
  rejectUnauthorized: false
};
const wuddup = require('./wuddup.js');
const announce = require('./announce.js');
const readFile = require('./readFile.js');
const writeToFile = require('./writeToFile.js');
const server = http.createServer(app);

let clientCount = 0;
let clients = {};

server.listen(port, function () {
  console.log('MightyFlock app listening on port 9745!')
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.use('/', express.static(__dirname));

app.get('/authresponse', (req, res) => {
  res.redirect(301, `/?${qs.stringify(req.query)}`);
});

app.get('/notifications', (req, res) => {
  readFile('alexa.txt', function (text) {
    res.send(text.trim());
    // writeToFile('alexa.txt', '');
  });
});

app.get('/mp3', (req, res) => {
  res.sendFile('askFlock.mp3' , { root : __dirname});
});

app.post('/audio', upload.single('data'), (req, res) => {
  res.json(req.file);
});

app.get('/parse-m3u', (req, res) => {
  const m3uUrl = req.query.url;
  console.log(m3uUrl)

  if (!m3uUrl) {
    return res.json([]);
  }

  const urls = [];

  request(m3uUrl, (error, response, bodyResponse) => {
    console.log(bodyResponse, m3uUrl)
    if (bodyResponse) {
      urls.push(bodyResponse);
    }

    res.json(urls);
  });
});

flock.appId = "d4ff7061-f575-4bc6-a46b-4ea4a463c8e0";
flock.appSecret = "caa05b4d-e500-4720-b443-3b1c004f5e16";

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

flock.events.on('app.install', (event, res) => {
    console.log("MADE IT");
    store.saveUserToken(event.userId, event.token);
});

flock.events.on('client.slashCommand', (event, callback) => {
  if (event.command === 'wuddup') {
    wuddup(event, callback);
  }

  if (event.command === 'announce') {
    announce(event, clients)
  }
});

wsServer.on('request', function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');

  let id = clientCount++;
  clients[id] = connection;

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    }
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
