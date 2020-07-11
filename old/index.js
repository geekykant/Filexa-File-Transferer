var express = require('express')
var multer = require('multer')
var fs = require('fs');
const path = require('path');

const app = express();
var cors = require('cors')
app.use(cors())

const PORT = 8080;

var http = require('http').Server(app);

var website_path = path.join(__dirname + '/views')
app.use(express.static(__dirname + '/public'));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(website_path + '/index.html'));
// });

app.get('/:uid', (req, res) => {
  var uid = req.params.uid;
  res.send(`${uid}  `);
});


http.listen(process.env.port || PORT, () => {
  console.log(`🚀Fired up on port ${PORT}`);
});
