const Logger = require('./logger')
const Network = require('./network')

/**
 * Attaches events to a socket. Also makes sure to provide event handlers
 * with a nifty client object allowing for easy communication with the
 * originating client (and it's neighbours)
 * @param {*} socket
 * @param {{}} events
 */
function attachEvents (monsterr, io, socket, events) {
  const client = {
    id: socket.id,

    send: (topic, message) => ({
      toClient () { socket.emit(topic, message) },
      toAllExceptClient () { socket.broadcast.emit(topic, message) },
      toNeighbours () {
        this.toNeighboursExceptClient() // send to all others
        io.to(socket.id).emit(topic, message) // and self
      },
      toNeighboursExceptClient () {
        let neighbours = monsterr.network.getNeighbours(socket.id)
        if (neighbours.length) {
          neighbours.reduce((chain, neighbour) => {
            return chain.to(neighbour)
          }, io).emit(topic, message)
        }
      }
    })
  }

  Object.keys(events).forEach(function (key, index) {
    socket.on(key, (...args) => {
      events[key](monsterr, client, ...args)
    })
  })
}

/* Options */
const defaultOptions = {
  port: 3000
}

/* Events */
const builtinEvents = {
  _msg (monsterr, client, msg) {
    // relay chat messages to group members
    client.send('_msg', msg).toNeighbours() // this includes self
  },
  _log (monsterr, client, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },
  _cmd (monsterr, client, json) {
    if (monsterr.getCommands()[json.cmd]) {
      monsterr.getCommands()[json.cmd](monsterr, client, ...json.args)
    }
  }
}

module.exports = (opts, io, startServer) => {
  function createServer ({
    network = Network.pairs(16),
    logger = Logger({}),
    options = {},
    events = {},
    commands = {},
    adminCommands = {}
  } = {}) {
    options = Object.assign(defaultOptions, options)

    // Admin connect to /admin namespace
    const adminNsp = io.of('/admin')
    adminNsp.on('connection', (socket) => {
      attachEvents(monsterr, adminNsp, socket, adminCommands)
      console.log('admin connected!')
    })

    // Clients connect to default namespace
    const clientsNsp = io.of('/clients')
    clientsNsp.on('connection', (socket) => {
      console.log('user ' + socket.id + ' connected!')
      network.addPlayer(socket.id)

      attachEvents(monsterr, clientsNsp, socket, builtinEvents)
      attachEvents(monsterr, clientsNsp, socket, events)

      socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected!')
        network.removePlayer(socket.id)
        socket.removeAllListeners()
      })
    })

    function run () { startServer(options.port) }

    function send (topic, message) {
      return {
        toAll () { clientsNsp.emit(topic, message) },
        toClient (socketId) { clientsNsp.to(socketId).emit(topic, message) }
      }
    }

    function log (msg, fileOrExtra, extra) {
      return logger.log(msg, fileOrExtra, extra)
    }

    /** API */
    const monsterr = {
      network,

      run,
      send,
      log,

      getCommands () { return commands },
      getEvents () { return events }
    }

    return monsterr
  }

  return createServer(opts)
}
