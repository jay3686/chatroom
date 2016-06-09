var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var totalCount = 0;
var server = http.Server(app);
var io = socket_io(server);

io.on('connection', (socket) => {
  console.log('Client connected', socket.server.engine.clientsCount);
  socket.broadcast.emit('message', `User Joined! ${socket.id}`);
  socket.broadcast.emit('totalCount', ++totalCount);
  
  socket.on('message', (message) => {
    console.log('Received message:', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('disconnect', (message) => {
    console.log('This guy peaced out.:', socket.id);
    socket.broadcast.emit('message', `User Left! ${socket.id}`);
    socket.broadcast.emit('totalCount', --totalCount);
  });
});



server.listen(8080);
