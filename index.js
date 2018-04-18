const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

const Logger = require('./imports/logger')
const Network = require('./imports/network')

// We serve static from /client. This allows games to easily include static assets by putting them in the /client directory.
app.use(express.static('client'))

/* Routes */
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})
app.get('/fabric', function (req, res) {
  res.sendFile(path.join(__dirname, 'imports', 'fabric-2.2.3.js'))
})
app.get('/monsterr', function (req, res) {
  res.sendFile(path.join(__dirname, '/monsterr.js'))
})

/**
 * Attaches events to a socket. Also makes sure to provide event handlers
 * with a nifty client object allowing for easy communication with the
 * originating client (and it's neighbours)
 * @param {*} socket
 * @param {{}} events
 */
function attachEvents (socket, events) {
  const client = {
    id: socket.id,

    send: (topic, message) => ({
      to: {
        client: () => socket.emit(topic, message),
        allExceptClient: () => socket.broadcast.emit(topic, message),
        neighbours () {
          this.neighboursExceptClient() // send to all others
          io.to(socket.id).emit(topic, message) // and self
        },
        neighboursExceptClient: () => {
          let neighbours = monsterr.network.getNeighbours(socket.id)
          if (neighbours.length) {
            neighbours.reduce((chain, neighbour) => {
              return chain.to(neighbour)
            }, io).emit(topic, message)
          }
        }
      }
    })
  }

  Object.keys(events).forEach(function (key, index) {
    socket.on(key, (...args) => {
      events[key](client, ...args)
    })
  })
}

/* Options */
const defaultOptions = {
  port: 3000
}

/* Events */
const internalEvents = {
  '_msg': function (client, msg) {
    // relay chat messages to group members
    client.send('_msg', msg).to.neighbours() // this includes self
  },
  '_log': function (client, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },
  '_cmd': function (client, json) {
    Object.keys(monsterr.commands).forEach(function (key, index) {
      if (key === json.cmd) {
        // simply run it
        monsterr.commands[json.cmd](client, json.args)
      };
    })
  }
}

/**
 * The monsterr object.
 * This object is exposed to the game and in turn exposes required functionality to the game. It is intended as a single touchpoint for games and the framework.
 */
const monsterr = {
  network: null, // initialized in run
  logger: Logger({}),

  events: {}, // custom events (to be filled by game)
  options: {}, // custom options (to be filled by game)
  commands: {}, // custom commands (to be filled by game)

  // should be called by the game when ready
  run () {
    // setup
    this.options = Object.assign(defaultOptions, this.options)
    this.network = Network.pairs(4)

    // wire sockets
    io.on('connection', (socket) => {
      console.log('user ' + socket.id + ' connected!')
      this.network.addPlayer(socket.id)
      attachEvents(socket, internalEvents)
      attachEvents(socket, this.events)

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
    to: {
      all: () => io.emit(topic, message),
      client: (socketId) => io.to(socketId).emit(topic, message)
    }
  }),

  /* logging */
  log: (msg, fileOrExtra, extra) => this.logger.log(msg, fileOrExtra, extra)
}

module.exports = monsterr
