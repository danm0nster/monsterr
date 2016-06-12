var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

module.exports = function() {
  // do some stuff
  app.use(express.static('assets'));

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
  });
  app.get('/client', function(req, res) {
    res.sendFile('client.js', {root: '.'});
  });
  app.get('/monsterr', function(req, res) {
    res.sendFile(__dirname + '/monsterr.js');
  });
  app.get('/fabric', function(req, res) {
    res.sendFile(__dirname + '/lib/fabric.js');
  });

  // io.on('connection', function(socket) {
  //   console.log('a user connected');
  //   socket.on('disconnect', function(){
  //     console.log('user disconnected');
  //   });
  //   socket.on('chat message', function(msg) {
  //     console.log('message: ' + msg);
  //     io.emit('chat message', msg);
  //   });
  // });

  // return object
  return {
    run: function(port) {
      var that = this;
      io.on('connection', function(socket) {
        console.log('a user connected');

        for (var e in that.events) {
          socket.on(e, (params) => {
            socket.reply = socket.emit;
            that.events[e](socket, params);
          });
        }
        socket.on('disconnect', function(){
          console.log('user disconnected');
        });
      });

      // default to http
      port = port || 80;

      http.listen(port, function() {
        console.log('listening on ' + port);
      });
    },

    // wrap io's emit function to allow monsterr.emit();
    emit: function(topic, message) {
      io.emit(topic, message);
    },

    // events
    // should be added to or overwritten to implement custom behaviour
    events: {
      'chat message': function(sender, msg) {
        io.emit('chat message', msg);
      }
    }
  }
}
