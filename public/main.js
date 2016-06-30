
$(document).ready(function () {
  var socket = io();
  var input = $('input');
  var messages = $('#messages');
  var typingMessage = $('#typingMessage');
  var totalCount = $('#totalCount');
  var userList = $('#userList');

  var addMessage = function (message) {
    messages.append('<div>' + message + '</div>');
  };

  var updateIsTyping = function (users) {
    if(users.length === 0) {
      typingMessage.text(' ');
    }
    else if(users.length === 1) {
      typingMessage.text(users[0] + ' is typing');
    }
    else if(users.length <= 3) {
      typingMessage.text(users.join(', ') + ' are typing');
    }
    else {
      typingMessage.text('Multiple people are typing');
    }
  };

  var updateConnected = function (users) {
    totalCount.text(users.length);
    userList.html(users.map((k) => `<li>${k}</li>`).join(''));
  };

  var typing = false;
  var timer;

  input.on('keydown', function (event) {
    if(!typing) {
      socket.emit('isTyping', true);
    }
    typing = true;
    clearTimeout(timer);
    timer = setTimeout(function (event) {
      typing = false;
      socket.emit('isTyping', false);
    }, 3000);
    
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    addMessage(message);
    socket.emit('message', message);
    input.val('');
  });

  socket.on('message', addMessage);
  socket.on('isTyping', updateIsTyping);
  socket.on('totalUsers', updateConnected);

});
