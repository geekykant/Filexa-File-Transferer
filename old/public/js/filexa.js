var genId, qrcode;

genId = Math.random().toString(32).slice(2)
console.log(genId);

qrcode = new QRCode(document.getElementById("qrcode"), {
  width: 200,
  height: 200
});

var filexa = {}
filexa.UID = genId;

document.getElementById('u_id').value = genId;
setLocalIP();

async function setLocalIP() {
  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for Firefox and chrome
  var pc = new RTCPeerConnection({
      iceServers: []
    }),
    noop = function() {};
  pc.createDataChannel(''); //create a bogus data channel
  pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
  pc.onicecandidate = function(ice) {
    if (ice && ice.candidate && ice.candidate.candidate) {
      var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = () => {
        // alert(`IP Address: ${myIP}`);
        filexa.IP = myIP + ":8080";
        // start();
        // setupUploader();
        qrcode.makeCode(JSON.stringify(filexa));
      }
    }
  };
}




// var socket_connect = room => {
//   console.log(filexa.IP);
//   return io('http://192.168.31.29:8080', {
//     query: 'room_id=' + room + "&ip=" + filexa.IP
//   });
// }
//
// function start() {
//   socket = socket_connect(filexa.UID);
//
//   socket.on('connect', () => {
//     // socket.emit('message', `Hello World from client ${filexa.UID}`);
//   });
//
//   socket.on('message', (message) => {
//     console.log(`${message}`);
//   });
//
//   socket.on('disconnect', () => {
//     console.log("Server disconnected!");
//   });
//
//   socket.on('error', err => {
//     console.log(`Problem seen: ${err}`);
//   });
// }
//
// function setupUploader() {
//   $("#button").click((e) => {
//     e.preventDefault();
//     var data = $('#file').prop('files')[0];
//     readThenSendFile(data);
//   });
//
//   function readThenSendFile(file) {
//     var fullPath = file.fullPath || file.name;
//     var fileType = file.type;
//     if (!fileType) {
//       fileType = window.mimeType[fullPath.split(".").pop()] || "";
//     }
//
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', 'http://' + filexa.IP + '/api/files', true);
//     xhr.setRequestHeader('Accept', 'application/json');
//     xhr.setRequestHeader('X-File-Path', encodeURI(fullPath).split("%20").join(" "));
//     xhr.setRequestHeader('X-File-Type', fileType);
//
//     var qItem = {
//       xhr: xhr,
//       fullPath: fullPath,
//       type: fileType,
//       total: file.size
//     };
//
//     xhr.onreadystatechange = function(e) {
//       if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//           qItem.done = true;
//           console.log('Done sending!!');
//           // track("file_uploaded", {
//           //   size: qItem.size,
//           //   type: qItem.type
//           // });
//           // portal.pumpFiles();
//         }
//       }
//     };
//     qItem.xhr.send(file);
//   }
// }
