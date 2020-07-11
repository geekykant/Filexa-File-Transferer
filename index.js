var express = require('express')
var fs = require('fs');
const path = require('path');
var compression = require('compression')

const app = express();
app.use(compression())
var router = express.Router()

var cors = require('cors')
app.use(cors())

router = app
// app.use('/Filexa', router)

// const SocketIOFile = require('socket.io-file');
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = 8080;

var website_path = path.join(__dirname + '/views')
router.use(express.static(__dirname + '/public'));

router.get('/', (req, res) => {
  res.render(path.join(website_path + '/index.ejs'),{"cache": true});
});

// app.get('/:uid', (req, res) => {
//   var uid = req.params.uid;
//   res.send(`${uid}  `);
// });

var UIDs = {}
const nsp = io.of('/connect')
startWebsocket()

router.get('/:uid', (req, res) => {
  res.send(UIDs[req.params.uid]);
});

router.get('/api/vals', (req, res) => {
  res.json(UIDs);
});

function startWebsocket() {
  nsp.on('connection', socket => {
    let UID = {};
    console.log("Clients connected: " + Object.keys(io.sockets.connected).length);

    // Broadcast to all.
    socket.emit('message', 'Server welcomes you, Hii✋');

    socket.on('web_connection', message => {
      let room = socket.handshake['query']['room_id'];
      let web_ip = socket.handshake['query']['web_ip'];
      socket.join(room);

      if (web_ip != undefined) {
        UID["web_ip"] = web_ip;
        UIDs[room] = UID;

        console.log('Connected web client: ' + room);
        console.log(`${room} : ${UID["web_ip"]}`);
      }
    });

    socket.on('app_connection', message => {
      console.log(message);

      let room = socket.handshake['query']['room_id'];
      let app_ip = socket.handshake['query']['app_ip'];

      socket.join(room);
      socket.to(room).emit('got_app_ip', app_ip);

      if (room != undefined) {
        UIDs[room]["app_ip"] = app_ip;

        console.log('Connected app client: ' + room);
        console.log(`${room} : ${UIDs[room]["app_ip"]}`);
      }
    });

    socket.on('message', message => {
      console.log(message);
    });

    // function disconnectRoom(room: string, namespace = '/') {
    //   io.of(namespace).in(room).clients((err, clients) => {
    //     clients.forEach(clientId => this.io.sockets.connected[clientId].disconnect());
    //   });
    // }

    socket.on('disconnect', () => {
      let room = socket.handshake['query']['room_id'];
      socket.leave(room);
      delete UIDs[room];
      socket.to(room).emit('touch_refresh', "let's play a game");
      console.log('user disconnected');
    });

    socket.on('error', err => {
      console.log('Problem ws: ' + err);
    });

  });
}

http.listen(process.env.port || PORT, () => {
  console.log(`🚀Fired up on port ${PORT}`);
});
