var monsterr = (function() {
  // setup socket and canvas
  var socket = io();

  $('form').submit(function(event) {
    event.preventDefault();
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  return {
    run: function(staticCanvas) {
      // initiate canvas
      if (staticCanvas) {
        this.canvas = new fabric.StaticCanvas('canvas');
      } else {
        this.canvas = new fabric.Canvas('canvas');
      }


      var that = this;
      for (var e in that.events) {
        socket.on(e, that.events[e]);
      };
    },

    // events
    // override or add to to implement behaviour
    events: {
      'chat message': function(msg) {
        $('#messages').append($('<li>').text(msg));
      }
    }
  };
})();
