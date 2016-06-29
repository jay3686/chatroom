'use strict';

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var totalCount = 0;
var server = http.Server(app);
var io = socket_io(server);

var users = {};
var typers = {};

function usernameTaken(username) {
  return Object.keys(users).some((key) => users[key].username === username);
}

function handleLogin(socket, username) {
  if (username === undefined || username === '') {
    socket.emit('message', 'Invalid username');
  }
  else if (usernameTaken(username)) {
    socket.emit('message', `Username '${username}' is already in use.`);
  }
  else {
    socket.emit('message', `'${users[socket.id].username}' changed their name to '${username}'.`);
    socket.broadcast.emit('message', `'${users[socket.id].username}' changed their name to '${username}'.`);

    users[socket.id] = { username };
    console.log('added user', username, users);
  }
}

function handleCommand(socket, message) {
  var tokens = message.split(' ');

  if (tokens[0] === '/login') {
    handleLogin(socket, tokens[1]);
  }
  else if (tokens[0] === '/list') {
    socket.emit('message', `Currently logged in: ${Object.keys(users).map((key) => (users[key].username))}`);
  }
  else {
    socket.emit('message', `Unknown Command '${message}'`);
  }
}

function assignUsername(socket) {
  users[socket.id] = { username: socket.id };
}

io.on('connection', (socket) => {
  assignUsername(socket);
  console.log('Client connected', users[socket.id].username);

  socket.broadcast.emit('message', `User Joined! ${users[socket.id].username}`);
  socket.emit('message', `User Joined! ${users[socket.id].username}`);

  socket.broadcast.emit('totalCount', ++totalCount);
  socket.emit('totalCount', totalCount);

  socket.on('message', (message) => {
    console.log('Received message:', message);
    if (message[0] == '/') {
      handleCommand(socket, message);
    } else {
      // TODO: let the frontend decide how to style this maybe
      socket.broadcast.emit('message', `${users[socket.id].username}: ${message}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('This guy peaced out.:', users[socket.id].username);
    socket.broadcast.emit('message', `User Left! ${users[socket.id].username}`);
    socket.broadcast.emit('totalCount', --totalCount);
    // TODO: rethink below if we have persistent users
    delete users[socket.id];
    delete typers[socket.id];
  });
  
  socket.on('isTyping', (typing) => {
    if (typing === false) {
      delete typers[socket.id];
    } else {
      typers[socket.id] = true;
    }

    const typingUsers = Object.keys(typers).map((key) => (users[key].username));
    console.log('Is typing:', typingUsers);
    socket.broadcast.emit('isTyping', typingUsers);
  });
});


server.listen(8080);
