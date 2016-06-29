var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// own modules
var _network = require('./imports/network');
var _logger = require('./imports/logger');

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
    var client = {
      id: socket.id,
      groupId: _monsterr.network.isMember(socket.id),

      /* Client specific messaging */
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
              io.to(_monsterr.network.isMember(socket.id)).emit(topic, message);
            },
            groupX: function() {
              socket.broadcast.to(_monsterr.network.isMember(socket.id)).emit(topic, message);
            }
          }
        }
      }
    };
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](client, params);
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
    '_msg': function(client, msg) {
      // relay chat messages to group members
      var gid = _monsterr.network.isMember(client.id);
      if (gid) {
        io.to(gid).emit('_msg', client.id.substring(2,7) + ': ' + msg);
      }
    },
    '_log': function(client, json) {
      _monsterr.log(json.msg, json.fileOrExtra, json.extra);
    },
    '_cmd': function(client, json) {
      Object.keys(_monsterr.commands).forEach(function(key, index) {
        if (key === json.cmd) {
          // simply run it
          _monsterr.commands[json.cmd](client, json.args);
        };
      });
    }
  };

  // return the monsterr object
  var _monsterr = {
    /* *** Objects *** */
    network: null,  // initialized in run
    events: {},     // custom events
    options: {},    // custom options
    commands: {},   // custom commands
    logger: _logger({}),

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
        socket.emit('_group_assignment', {groupId});


        // EVENTS & MESSAGING
        _attachEvents(socket, _internalEvents);
        _attachEvents(socket, that.events);

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

    // General messaging
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
    },

    // Log stuff
    log: function(msg, fileOrExtra, extra) {
      if (msg && fileOrExtra && extra) {
        this.logger.log(msg, fileOrExtra, extra);
      } else if (msg && fileOrExtra) {
        this.logger.log(msg, fileOrExtra);
      } else {
        this.logger.log(msg);
      }
    }
  };

  return _monsterr;

})();
