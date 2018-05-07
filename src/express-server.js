import { EventEmitter } from 'events'

// const session = require('express-session')({
//   secret: 'monstrous_secret',
//   resave: true,
//   saveUninitialized: true
// })
// const sharedSession = require('express-socket.io-session')

const express = require('express')
const app = express()
const path = require('path')
const http = require('http').Server(app)
const io = require('socket.io')(http)

// Use sessions
// app.use(session)
// io.use(sharedSession(session))

// We serve static from /client. This allows games to easily include static assets by putting them in the /client directory.
app.use(express.static('dist'))
app.use('/assets', express.static('assets'))

/* Routes */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')))
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../index.html')))
// app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin.html')))
app.get('/fabric', (req, res) => res.sendFile(path.join(__dirname, '../imports', 'fabric-2.2.3.js')))

// Options are passed through to createServer inside of module
export function createHttpServer ({
  port = 3000
}) {
  http.listen(port, () => {
    console.log('listening on ' + port)
  })
}

class SocketServer extends EventEmitter {
  constructor () {
    super()

    this.clientsNsp = io.of('/clients')
    this.adminNsp = io.of('/admin')

    /** Connections */
    this.clientsNsp.on('connection', socket => {
      this.emit('connect', socket.id)
      const withClientId = cmdOrEvent => ({ ...cmdOrEvent, clientId: socket.id })

      // server.clientConnected(socket.id)
      socket.on('cmd', cmd => this.emit('cmd', withClientId(cmd)))
      socket.on('event', event => this.emit('event', withClientId(event)))

      socket.on('disconnect', () => {
        socket.removeAllListeners()
        this.emit('disconnect', socket.id)
      // server.clientDisconnected(socket.id)
      })
    })

    this.adminNsp.on('connection', socket => {
      socket.on('cmd', cmd => this.emit('cmd', cmd))
      socket.on('disconnect', () => socket.removeAllListeners())
    })
  }

  send (type = 'event', obj = {}) {
    return {
      toAll: () => this.clientsNsp.emit(type, obj),
      toClients: (clients = []) =>
        clients.length && clients.reduce(
          (chain, client) => chain.to(client),
          this.clientsNsp
        ).emit(type, obj),
      toAdmin: () => this.adminNsp.emit(type, obj)
    }
  }

  sendCommand (cmd) {
    return this.send('cmd', cmd)
  }
  sendEvent (event) {
    return this.send('event', event)
  }
}

export function createSocketServer () {
  return new SocketServer()
}
