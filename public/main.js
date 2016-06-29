
$(document).ready(function () {
  var socket = io();
  var input = $('input');
  var messages = $('#messages');
  var typingMessage = $('#typingMessage');
  var totalCount = $('#totalCount');

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

  var updateConnectedCount = function (numUsers) {
    totalCount.text(numUsers);
  };

  var typing = false;
  var timer;

  input.on('keydown', function (event) {
    socket.emit('isTyping', true);
    if(!typing) {
      console.log('user is typing');      
    }
    typing = true;
    clearTimeout(timer);
    timer = setTimeout(function (event) {
      console.log('user stopped typing');
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
  socket.on('totalCount', updateConnectedCount);

});
