var express = require('express')
var multer = require('multer')
var fs = require('fs');
const path = require('path');

const SocketIOFile = require('socket.io-file');
var PORT = 8080;

const app = require('express')();
const router = express.Router();
var cors = require('cors')
app.use(cors())
app.use('/', router);

var http = require('http').Server(app);
var io = require('socket.io')(http);

var website_path = path.join(__dirname + '/views')
app.use(express.static(__dirname + '/public'));

router.get('/', (req, res) => {
  res.sendFile(path.join(website_path + '/index.html'));
});

var UIDMap = {}
var UIDs = {}
startWebsocket()

router.get('/:uid', (req, res) => {
  res.send(`{"${req.params.uid}" : "${UIDMap[req.params.uid]}"}`);
});

router.get('/api/vals', (req, res) => {
  res.json(UIDs);
});

router.post('/api/files', (req, res) => {
  res.sendStatus(200);
});

function startWebsocket() {
  io.on('connection', socket => {
    var room = socket.handshake['query']['room_id'];
    var ip = socket.handshake['query']['ip'];
    socket.join(room);

    console.log("Clients connected: " + Object.keys(io.sockets.connected).length);

    if (ip != undefined) {
      UIDMap[room] = ip;
      console.log('Connected client: ' + room);
      console.log(`${room} : ${UIDMap[room]}`);

      //TODO: Check no. of clients in room & if no destop - stop connection on mobile
    } else {
      console.log('Connected mobile client!');
    }

    // Broadcast to all.
    socket.emit('message', 'Server welcomes you, Hii✋');

    // socket.on('chat message', function(msg) {
    //   io.to(room).emit('messages', msg);
    // });

    socket.on('message', message => {
      console.log(message);
    });

    socket.on('set_connection', message => {
      var json = JSON.parse(message);
      room = Object.keys(json)[0];
      UIDs[room] = json[room]
      socket.emit('message', message);
      // UIDMap['receiver_ip'] = message
    });

    // socket.on('set_sender_ip', message => {
    //   UIDMap[room]["sender_ip"] = message;
    // });

    socket.on('disconnect', function() {
      socket.leave(room)

      if (ip != undefined) {
        delete UIDMap[room]
        delete UIDs[room]
      }
      console.log('user disconnected');
    });

    socket.on('error', function(err) {
      console.log('Problem ws: ' + err);
    });

  });
}

// setInterval(() => {
//   server.clients.forEach((socket) => {
//     if (!socket.isAlive) return socket.terminate();
//
//     socket.isAlive = false;
//     socket.ping(null, false, true);
//   });
// }, 10000);


http.listen(process.env.port || PORT, () => {
  console.log(`🚀Fired up on port ${PORT}`);
});
