var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// own modules
var _network = require('./imports/network');

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
  var _attachEvents = function(monsterr, socket, events) {
    var client = {
      id: socket.id,
      groupId: monsterr.network.isMember(socket.id),
      send: function(topic, message) {
        return {
          to: {
            client: function() {
              socket.emit(topic, message);
            },
            all: function() {
              io.emit(topic, message);
            },
            allX: function() {
              socket.broadcast.emit(topic, message);
            },
            group: function() {
              io.to(monsterr.network.isMember(socket.id)).emit(topic, message);
            },
            groupX: function() {
              socket.broadcast.to(monsterr.network.isMember(socket.id)).emit(topic, message);
            }
          }
        }
      }
    };
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](client, params, monsterr);
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
    'message': function(client, msg, monsterr) {
      // relay chat messages to group members
      var gid = monsterr.network.isMember(client.id);
      if (gid) {
        io.to(gid).emit('message', msg);
      }
    }
  };

  // return the monsterr object
  return {
    /* *** Objects *** */
    network: null,  // initialized in run
    events: {},     // custom events
    options: {},    // custom options

    // * run *
    // This starts the framework and should be called AFTER options and events have been defined
    run: function() {
      var that = this;

      // LOAD OPTIONS
      that.options = Object.assign(_defaultOptions, that.options); // combine user defined options and defaults

      // START NETWORK
      that.network = _network({
        groupSize: that.options.groupSize
      });

      // SOCKET.IO
      io.on('connection', function(socket) {
        const sid = socket.id;
        console.log('user ' + sid + ' connected!');

        // Add to network
        var groupId = that.network.addMember(sid);
        socket.join(groupId);
        socket.emit('group_assignment', {groupId});


        // EVENTS
        _attachEvents(that, socket, _internalEvents);
        _attachEvents(that, socket, that.events);

        socket.on('disconnect', function(){
          console.log('user ' + sid + ' disconnected!');
          that.network.removeMember(sid);
        });
      });

      // START SERVER
      http.listen(that.options.port, function() {
        console.log('listening on ' + that.options.port);
      });
    },

    // wrap io's emit function to allow monsterr.emit();
    send: function(topic, message) {
      return {
        to: {
          all: function() {
            io.emit(topic, message);
          },
          group: function(groupId) {
            io.to(groupId).emit(topic, message);
          },
          client: function(clientId) {
            io.to(clientId).emit(topic, message);
          }
        }
      }
    }
  }

})();
