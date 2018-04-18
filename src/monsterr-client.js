/* globals io $ fabric */

/* Intentional global. Maybe one day we can get rid of it. */
var monsterr = (function () { // eslint-disable-line no-unused-vars
  // setup socket
  const socket = io()

  // setup chat
  $('form').submit(function (event) {
    event.preventDefault()

    // parse whatever input the user submitted
    parseInput($('#m').val())
    $('#m').val('')

    return false
  })

  function parseInput (string) {
    if (string.substring(0, 1) === '/') {
      // treat as command
      const args = string.substring(1).split(' ')
      const cmd = args[0]
      // send to server
      handleCommand(cmd, args.splice(1))
    } else {
      // treat as chat message
      socket.emit('_msg', string)
    }
  }

  const handleCommand = function (cmd, args) {
    let fn = monsterr.commands[cmd]
    if (fn && fn(args)) {
      socket.emit('_cmd', { cmd, args })
    }
  }

  // attach events, this will connect all the custom and internal events to the actual socket.io events
  const attachEvents = function (socket, events) {
    Object.keys(events).forEach(function (key, index) {
      socket.on(key, function (params) {
        events[key](params)
      })
    })
  }

  // setup canvas helper
  const setupCanvas = function (that) {
    // get canvas
    const canvas = that.canvas
    // apply background-color
    canvas.setBackgroundColor(that.options.canvasBackgroundColor)

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false)

    function resizeCanvas () {
      canvas.setWidth(window.innerWidth)
      canvas.setHeight(window.innerHeight - that.options.chatHeight)
      canvas.renderAll()
    }
    resizeCanvas()
  }

  const defaultOptions = {
    staticCanvas: false,
    chatHeight: 200,
    canvasBackgroundColor: '#999'
  }
  const events = {
    '_msg' (msg) {
      $('#messages').prepend($('<li>').text(msg))
    },
    '_group_assignment' (msg) {
      $('#messages').prepend($('<li>').text('You\'ve been assigned group #' + msg.groupId))
    }
  }
  const commands = {
    'clear' (args) {
      $('#messages').html('')
      return false // don't send this
    }
  }

  const monsterr = {
    options: {},
    events: {},
    commands: {},
    canvas: null,

    // wrap socket.io methods
    send (topic, message) {
      socket.emit(topic, message)
    },

    run () {
      this.options = Object.assign(defaultOptions, this.options)
      this.commands = Object.assign(commands, this.commands)

      // initiate canvas
      if (this.options.staticCanvas) {
        this.canvas = new fabric.StaticCanvas('canvas')
      } else {
        this.canvas = new fabric.Canvas('canvas')
      }
      setupCanvas(this)

      // attach the events
      attachEvents(socket, events) // internal
      attachEvents(socket, this.events) // & custom
    },

    log (msg, fileOrExtra, extra) {
      this.send('_log', {
        msg, fileOrExtra, extra
      })
    },

    chat: {
      prepend (msg) {
        $('#messages').prepend($('<li>').text(msg))
      },
      clear () {
        $('#messages').html('')
      }
    }
  }

  return monsterr
})()
