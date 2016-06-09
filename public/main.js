$(document).ready(function () {
  var socket = io();
  var input = $('input');
  var messages = $('#messages');
  var totalCount = $('#totalCount');

  var addMessage = function (message) {
    messages.append('<div>' + message + '</div>');
  };

  var updateConnectedCount = function (numUsers) {
    totalCount.text(numUsers);
  };

  input.on('keydown', function (event) {
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    addMessage(message);
    socket.emit('message', message);
    input.val('');
  });

  socket.on('message', addMessage);
  socket.on('totalCount', updateConnectedCount);

  // set initial total count
  totalCount.text(socket.subs.length);
});
