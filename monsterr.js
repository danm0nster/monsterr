// defined monsterr as an immediatly invoked function returning the monsterr object, so as to make it available for client.js
var monsterr = (function() {
  // setup socket
  var socket = io();

  // setup chat
  $('form').submit(function(event) {
    event.preventDefault();
    socket.emit('message', $('#m').val());
    $('#m').val('');
    return false;
  });

  // attach events, this will connect all the custom and internal events to the actual socket.io events
  var attachEvents = function(socket, events) {
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](socket, params);
      });
    });
  };

  // return monsterr object
  return {
    // setup canvas helper
    _setupCanvas: function(canvas) {
      var that = this;
      // resize the canvas to fill browser window dynamically
      window.addEventListener('resize', resizeCanvas, false);

      function resizeCanvas() {
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(window.innerHeight - that.options.chatHeight);
        canvas.renderAll();
      }
      resizeCanvas();
    },

    options: {
      chatHeight: 200,
      canvasBackgroundColor: '#999'
    },

    run: function(staticCanvas) {
      // initiate canvas
      if (staticCanvas) {
        this.canvas = new fabric.StaticCanvas('canvas');
      } else {
        this.canvas = new fabric.Canvas('canvas');
      }
      this._setupCanvas(this.canvas);

      // attach the events
      attachEvents(socket, this._events); // internal
      attachEvents(socket, this.events); // & custom

      // apply background-color
      this.canvas.setBackgroundColor(this.options.canvasBackgroundColor);
    },

    // internal events
    _events: {
      'message': function(sender, msg) {
        $('#messages').prepend($('<li>').text(msg));
      }
    },
    // custom events
    events: {}

  };
})();
