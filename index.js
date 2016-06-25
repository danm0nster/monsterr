var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// own modules
var network = require('./lib/network');

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
    res.sendFile(__dirname + '/imports/fabric.js');
  });

  // attach events, this will connect all the custom and internal events to the actual socket.io events
  var _attachEvents = function(socket, events) {
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](socket, params);
      });
    });
  };

  // Options
  var _defaultOptions = {
    port: 3000,
    groupSize: 2
  };
  // Events
  var _internalEvents = {
    'message': function(sender, msg) {
      // relay chat messages to all clients
      io.emit('message', msg);
    }
  };

  // return the monsterr object
  return {
    /* *** Objects *** */
    network: null,  // initialized in run
    events: {},     // custom events
    options: {},    // custom options

    /* *** Methods *** */

    // * run *
    // This starts the framework and should be called AFTER options and events have been defined
    run: function() {
      var that = this;

      // LOAD OPTIONS
      that.options = Object.assign(_defaultOptions, that.options); // combine user defined options and defaults

      // START NETWORK
      that.network = network({
        groupSize: that.options.groupSize
      });

      // SOCKET.IO
      io.on('connection', function(socket) {
        console.log('user connected');

        // EVENTS
        _attachEvents(socket, _internalEvents);
        _attachEvents(socket, that.events);

        socket.on('disconnect', function(){
          console.log('user disconnected');
        });
      });

      // START SERVER
      http.listen(that.options.port, function() {
        console.log('listening on ' + that.options.port);
      });
    },

    // wrap io's emit function to allow monsterr.emit();
    emit: function(topic, message) {
      io.emit(topic, message);
    }
  }

})();
