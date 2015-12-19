var express = require('express');
var expressInvoked = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/speakEzUsers');
var http = require('http');
var middleware = require('./config/middleware.js');
var config = {
	port: 1337
}
var app = require('http').Server(expressInvoked);
middleware(app, express); //sams middleware

var server = http.createServer(app);

app.listen(config.port, function () {
	console.log('Application listening on port:', config.port);
});
