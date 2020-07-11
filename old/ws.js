// const WebSocket = require('ws');
// var dl = require('delivery');
//
// const server = new WebSocket.Server({
//     port: (process.env.PORT || 9000)
//   },
//   webSockets = {});
//
// startWebsocket()
//
// function startWebsocket() {
//   server.on('connection', (socket, req) => {
//     var userID = req.url.substr(1)
//     webSockets[userID] = socket
//     console.log('Connected client: ' + userID)
//
//     // Broadcast to all.
//     socket.send("Hi, I am websocket server!");
//
//     //handling broken connections
//     socket.isAlive = true;
//     socket.on('pong', () => {
//       socket.isAlive = true;
//     });
//
//     socket.on('message', (data) => {
//       console.log('received from ' + userID + ': ' + data)
//     });
//
//     socket.on('close', () => {
//       console.log('socket destroyed!');
//       delete webSockets[userID]
//       console.log('deleted: ' + userID)
//     });
//   });
// }
//
// setInterval(() => {
//   server.clients.forEach((socket) => {
//     if (!socket.isAlive) return socket.terminate();
//
//     socket.isAlive = false;
//     socket.ping(null, false, true);
//   });
// }, 10000);
