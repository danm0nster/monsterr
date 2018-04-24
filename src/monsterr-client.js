/* globals io $ fabric */

let socket
if (typeof io !== 'undefined') {
  socket = io && io('/clients')
}

/* Chat */
function preprendChatMessage (msg) {
  $('#messages').prepend($('<li>').text(msg))
}
function clearChat () { $('#messages').html('') }

function createChat (monsterr) {
  $('form').submit(function (event) {
    event.preventDefault()

    // parse whatever input the user submitted
    let { chatMsg, cmd } = parseInput($('#m').val())
    $('#m').val('')

    if (chatMsg) {
      socket.emit('_msg', chatMsg)
    } else if (cmd) {
      let args = cmd.split(' ')
      handleCommand(...args)
    }

    return false
  })

  function parseInput (string) {
    let chatMsg
    let cmd

    if (string.substring(0, 1) === '/') {
      // treat as command
      cmd = string.substring(1)
    } else {
      chatMsg = string
    }

    return { chatMsg, cmd }
  }

  function handleCommand (cmd, ...args) {
    let fn = monsterr.getCommands()[cmd]
    if (!fn || fn(monsterr, ...args) !== false) {
      socket.emit('_cmd', { cmd, args })
    }
  }
}

function attachEvents (monsterr, socket, events) {
  Object.keys(events).forEach(function (key, index) {
    socket.on(key, function (params) {
      events[key](monsterr, params)
    })
  })
}

function send (topic, message) {
  socket.emit(topic, message)
}

function log (msg, fileOrExtra, extra) {
  send('_log', { msg, fileOrExtra, extra })
}

const createCanvas = function (options) {
  let canvas = options.staticCanvas
    ? new fabric.StaticCanvas('canvas')
    : new fabric.Canvas('canvas')

  // apply background-color
  canvas.setBackgroundColor(options.canvasBackgroundColor)

  // resize the canvas to fill browser window dynamically
  function resizeCanvas () {
    canvas.setWidth(window.innerWidth)
    canvas.setHeight(window.innerHeight - options.chatHeight)
    canvas.renderAll()
  }
  window.addEventListener('resize', resizeCanvas, false)
  resizeCanvas()

  return canvas
}

const defaultOptions = {
  staticCanvas: false,
  chatHeight: 200,
  canvasBackgroundColor: '#999'
}
const builtinEvents = {
  '_msg' (_, msg) {
    $('#messages').prepend($('<li>').text(msg))
  }
}
const builtinCommands = {
  'clear' (_, ...args) {
    $('#messages').html('')
    return false // don't send this
  }
}

function createClient ({
  options = {},
  events = {},
  commands = {}
} = {}) {
  options = Object.assign(defaultOptions, options)
  commands = Object.assign(builtinCommands, commands)
  const canvas = createCanvas(options)

  const chat = {
    prepend (msg) { preprendChatMessage(msg) },
    clear () { clearChat() }
  }

  /** API */
  const monsterr = {
    canvas,
    send,
    log,
    chat,

    getCommands () { return commands },
    getEvents () { return events }
  }

  attachEvents(monsterr, socket, builtinEvents)
  attachEvents(monsterr, socket, events)

  createChat(monsterr)

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      monsterr.id = socket.id
      resolve(monsterr)
    })
  })
}

module.exports = createClient
