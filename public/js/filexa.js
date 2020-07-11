var filexa = {}
filexa.UID = Math.random().toString(32).slice(2) + Math.random().toString(32).slice(5);

//setting up UID
$('#u_id').val(filexa.UID);
console.log(filexa.UID);
setLocalIP();

//getting localIP
function setLocalIP() {
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
        if (filexa.IP != myIP + ":8080") {
          filexa.IP = myIP + ":8080";
          makeqrCode();
          setupWebsocket();
        }

      }
    }
  };
}

function makeqrCode() {
  console.log(filexa)
  $("#qrcode").qrcode({
    render: "image",
    size: 200 * 1,
    text: filexa.UID
  })
}

// //setting up local client
// setupUploader();
// function setupUploader() {
//   // $("#button").click((e) => {
//   //   e.preventDefault();
//   //   $(".progress-bar").css("width", 0 + "%").text(0 + " %");
//   //
//   //   let file = $('#file').prop('files')[0];
//   //   sendFile(file)
//   // });
// }

var url = null;

//sending Function
function sendFile(file) {
  var f_id = Math.random().toString(32).slice(5);
  var fullPath = file.fullPath || file.name;
  var fileType = file.type;
  // if (!fileType) {
  //   fileType = window.mimeType[fullPath.split(".").pop()] || "";
  // }

  makeProgress = function(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round((evt.loaded / evt.total) * 100);
      $("div#" + f_id).css("width", percentComplete + "%").text(fullPath + " (" + percentComplete + " %)");
    }
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('X-File-Path', encodeURI(fullPath).split("%20").join(" "));
  xhr.setRequestHeader('X-File-Type', fileType);
  var t0;
  xhr.onprogress = makeProgress;
  xhr.upload.addEventListener('progress', makeProgress, false);
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var t1 = performance.now();
        console.log("Call to doSomething took " + (t1 - t0) / 1000 + " seconds.")
        console.log(xhr.response);
      }
    }
  };
  xhr.onerror = function(e) {
    console.log(e);
  };
  t0 = performance.now();
  $("#all_progress").append(`<div id="` + f_id + `" class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:0%">0%</div>`)
  xhr.send(file);
}

//Dropzone Configuration
Dropzone.autoDiscover = false;

function setupDropzone() {
  $("#demo_upload").dropzone({
    // url: url,
    autoProcessQueue: false,
    previewTemplate: document.querySelector('#preview-template').innerHTML,
    parallelUploads: 2,
    maxFilesize: null,
    //TODO: Fix browse add file manually
    // addedfile: (file) => {
    //   if (file != null) {
    //     sendFile(file);
    //   }
    // },
    drop: (e) => {
      console.log('Sending!');
      e.stopPropagation();
      e.preventDefault();
      items = e.dataTransfer.items;

      if (items != null) {
        // console.log("items not null....");
        i = 0;
        while (i < items.length) {
          item = items[i].webkitGetAsEntry();
          read(item);
          i++;
        }
        return;
      }

      // files = e.dataTransfer.files;
      // if (files != null) {
      //   console.log("using files....");
      //   for (j = 0, len = files.length; j < len; j++) {
      //     file = files[j];
      //     sendFile(file);
      //   }
      // }
    }
  });

  //Reading if isDirectory & retrieve files
  read = function(item) {
    var reader;
    if (item === null) {
      return;
    }
    if (item.isDirectory) {
      reader = item.createReader();
      return reader.readEntries(function(entries) {
        return entries.forEach(function(entry) {
          return read(entry);
        });
      });
    } else if (item.isFile) {
      return item.file(function(file) {
        file.fullPath = item.fullPath;
        return sendFile(file);
      });
    }
  };
}

//setting up websocket
function setupWebsocket() {
  var socket_connect = function(room) {
    console.log(filexa.IP);
    //TODO: Change to api.filexa.io

    return io('/connect', {
      query: 'room_id=' + room + "&web_ip=" + filexa.IP,
      multiplex: false
    });
  }

  socket = socket_connect(filexa.UID);
  socket.on('connect', () => {
    // socket.emit('message', `Hello World from client ${filexa.UID}`);
    socket.emit('web_connection', `Hello World from client ${filexa.UID}`);
  });

  socket.on('message', (message) => {
    console.log(`${message}`);
  });

  socket.on('got_app_ip', (app_ip) => {
    console.log("got_app_ip: " + app_ip);
    url = "http://" + app_ip + "/files";
    $('#dot_connection').css('background-color', '#2ada2a');
    $('#dot_text').html('Connected');
  });

  socket.on('disconnect', () => {
    console.log("Server disconnected!");
    $('#dot_connection').css('background-color', 'red');
    $('#dot_text').html('Disconnected');
  });

  socket.on('touch_refresh', () => {
    $('#dot_connection').css('background-color', 'red');
    $('#dot_text').html('Disconnected');
    console.log("Server disconnected!");
    //TODO: Change it on production
    window.location.href = '/';
  });

  socket.on('error', err => {
    console.log(`Problem seen: ${err}`);
  });

}

$(document).ready(function() {
  setupDropzone();
});
