// defined monsterr as an immediatly invoked function returning the monsterr object, so as to make it available for client.js
var monsterr = (function() {
  // setup socket
  var _socket = io();

  // setup chat
  $('form').submit(function(event) {
    event.preventDefault();
    _socket.emit('message', $('#m').val());
    $('#m').val('');
    return false;
  });

  // attach events, this will connect all the custom and internal events to the actual socket.io events
  var _attachEvents = function(socket, events) {
    Object.keys(events).forEach(function(key, index) {
      socket.on(key, function(params) {
        events[key](socket, params);
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
    'message': function(sender, msg) {
      $('#messages').prepend($('<li>').text(msg));
    }
  };


  // return monsterr object
  return {
    // Options
    options: {},
    // custom events
    events: {},

    run: function() {
      this.options = Object.assign(_options, this.options); // combine user defined options and defaults

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
    }
  };
})();
