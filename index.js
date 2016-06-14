var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

module.exports = (function() {
  // static from /assets
  app.use(express.static('assets'));

  // set up routes
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

  // attach events, this will connect all the custom and internal events to the actual socket.io events
  var attachEvents = function(socket, events) {
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](socket, params);
      });
    });
  };

  // return the monsterr object
  return {
    run: function(port) {
      var that = this;
      io.on('connection', function(socket) {
        console.log('a user connected');

        attachEvents(socket, that._events);
        attachEvents(socket, that.events);

        socket.on('disconnect', function(){
          console.log('user disconnected');
        });
      });

      // default to http
      port = port || 80;

      // start server
      http.listen(port, function() {
        console.log('listening on ' + port);
      });
    },

    // wrap io's emit function to allow monsterr.emit();
    emit: function(topic, message) {
      io.emit(topic, message);
    },

    // internal events
    _events: {
      'message': function(sender, msg) {
        // relay chat messages to all clients
        io.emit('message', msg);
      }
    },
    // custom events
    events: {}
  }

})();
