//THIS IS ALSO THE BEGINNING
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');

// access our middleware functions
var middleware = require('./config/middleware.js');

mongoose.connect('mongodb://localhost/speakEzUsers');

var app = express();
// require('./users/userRoutes.js')(app);

app.use(express.static(__dirname + '/../client'));
middleware(app, express);

var port = 8000;

var server = http.createServer(app);

server.listen(port, function () {
	console.log('listening on port:', port);
});

module.exports = app;