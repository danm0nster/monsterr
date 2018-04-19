
const Server = require('http').Server
const IO = require('socket.io')

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
const internalEvents = {
  _msg (monsterr, client, msg) {
    // relay chat messages to group members
    client.send('_msg', msg).toNeighbours() // this includes self
  },
  _log (monsterr, client, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },
  _cmd (monsterr, client, json) {
    Object.keys(monsterr.commands).forEach(function (key, index) {
      if (key === json.cmd) {
        // simply run it
        monsterr.commands[json.cmd](client, json.args)
      };
    })
  }
}

/**
  * Simply wires up the express app with monsterr
  * @param {*} app
  */
function monsterrServer (app) {
  const http = Server(app)
  const io = IO(http)

  /**
    *  The monsterr object.
    * This object is exposed to the game and in turn exposes required
    * functionality to the game. It is intended as a single touchpoint
    * for games and the framework.
    */
  const monsterr = {
    network: null, // initialized in run
    logger: Logger({}),
    events: {}, // custom events (to be filled by game)
    options: {}, // custom options (to be filled by game)
    commands: {}, // custom commands (to be filled by game)

    // should be called by the game when ready
    run () {
      this.options = Object.assign(defaultOptions, this.options)
      if (!this.network) { // hasn't been initialized
        this.network = Network.pairs(4)
      }

      // wire sockets
      io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected!')
        this.network.addPlayer(socket.id)

        attachEvents(monsterr, io, socket, internalEvents)
        attachEvents(monsterr, io, socket, this.events)

        socket.on('disconnect', () => {
          console.log('user ' + socket.id + ' disconnected!')
          this.network.removePlayer(socket.id)
          socket.removeAllListeners()
        })
      })

      // start server
      http.listen(this.options.port, () => {
        console.log('listening on ' + this.options.port)
      })
    },

    /* general messaging */
    send: (topic, message) => ({
      toAll () { io.emit(topic, message) },
      toClient (socketId) { io.to(socketId).emit(topic, message) }
    }),

    /* logging */
    log (msg, fileOrExtra, extra) { this.logger.log(msg, fileOrExtra, extra) }
  }

  return monsterr
}

module.exports = monsterrServer
