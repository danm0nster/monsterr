// defined monsterr as an immediatly invoked function returning the monsterr object, so as to make it available for client.js
var monsterr = (function() {
  // setup socket
  var _socket = io();

  // setup chat
  $('form').submit(function(event) {
    event.preventDefault();

    // parse whatever input the user submitted
    _parseInput($('#m').val());

    $('#m').val('');
    return false;
  });


  var _parseInput = function(string) {
    if (string.substring(0,1) === '/') {
      // treat as command
      var args = string.substring(1).split(' ');
      var cmd = args[0];
      var args = args.splice(1);
      // send to server
      _handleCommand(cmd, args);
    } else {
      // treat as chat message
      _socket.emit('_msg', string);
    }
  };


  var _handleCommand = function(cmd, args) {
    var sendToServer = true;
    Object.keys(_monsterr.commands).forEach(function(key, index) {
      if (key === cmd) {
        // if the command doesn't return false
        if (_monsterr.commands[cmd](args) === false) {
          // don't send it to server
          sendToServer = false;
        };
      };
    });
    // should we sent it?
    if (sendToServer) {
      _socket.emit('_cmd', {cmd, args});
    }
  };


  // attach events, this will connect all the custom and internal events to the actual socket.io events
  var _attachEvents = function(socket, events) {
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](params);
      });
    });
  };

  // setup canvas helper
  var _setupCanvas = function(that) {
    // get canvas
    var canvas = that.canvas;
    // apply background-color
    canvas.setBackgroundColor(that.options.canvasBackgroundColor);

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - that.options.chatHeight);
      canvas.renderAll();
    }
    resizeCanvas();
  };

  var _options = {
    staticCanvas: false,
    chatHeight: 200,
    canvasBackgroundColor: '#999'
  };
  var _events = {
    '_msg': function(msg) {
      $('#messages').prepend($('<li>').text(msg));
    },
    '_group_assignment': function(msg) {
      $('#messages').prepend($('<li>').text('You\'ve been assigned group #' + msg.groupId));
    }
  };
  var _commands = {
    'clear': function(args) {
      $('#messages').html('');
      return false; // don't send this
    }
  }

  var _monsterr = {
    // options
    options: {},
    // custom events
    events: {},
    // commands
    commands: {},
    canvas: null, // created in run in run

    // wrap socket.io methods
    send: function(topic, message) {
      _socket.emit(topic, message);
    },

    run: function() {
      this.options = Object.assign(_options, this.options); // combine user defined options and defaults
      this.commands = Object.assign(_commands, this.commands);

      // initiate canvas
      if (this.options.staticCanvas) {
        this.canvas = new fabric.StaticCanvas('canvas');
      } else {
        this.canvas = new fabric.Canvas('canvas');
      }
      _setupCanvas(this);

      // attach the events
      _attachEvents(_socket, _events); // internal
      _attachEvents(_socket, this.events); // & custom
    },

    log: function(msg, fileOrExtra, extra) {
      this.send('_log', {
        msg, fileOrExtra, extra
      });
    },

    chat: {
      prepend: function(msg) {
        $('#messages').prepend($('<li>').text(msg));
      }
    }
  };

  return _monsterr;
})();
