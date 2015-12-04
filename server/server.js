//THIS IS ALSO THE BEGINNING
var express = require('express');
//var middleware = require('./config/middleware.js');
var http = require('http');

var app = express();

app.use(express.static(__dirname + '/../client'));
//middleware(app, express);

var port = 8000;

var server = http.createServer(app);

server.listen(port, function () {
  console.log('listening on port:', port);
});

module.exports = app;
