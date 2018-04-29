// const session = require('express-session')({
//   secret: 'monstrous_secret',
//   resave: true,
//   saveUninitialized: true
// })
// const sharedSession = require('express-socket.io-session')

import monsterrServer from './monsterr-server'
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
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin.html')))
app.get('/fabric', (req, res) => res.sendFile(path.join(__dirname, '../imports', 'fabric-2.2.3.js')))

// Options are passed through to createServer inside of module
module.exports = opts => {
  const { monsterr: server, emitter } = monsterrServer(opts, (port) => {
    http.listen(port, () => {
      console.log('listening on ' + port)
    })
  })

  const clientsNsp = io.of('/clients')
  const adminNsp = io.of('/admin')

  /** Connections */
  clientsNsp.on('connection', socket => {
    const withClientId = cmdOrEvent => ({ ...cmdOrEvent, clientId: socket.id })

    server.clientConnected(socket.id)
    socket.on('cmd', cmd => server.handleCommand(withClientId(cmd)))
    socket.on('event', event => server.handleEvent(withClientId(event)))

    socket.on('disconnect', () => {
      socket.removeAllListeners()
      server.clientDisconnected(socket.id)
    })
  })

  adminNsp.on('connection', socket => {
    socket.on('cmd', cmd => server.handleCommand(cmd))
    socket.on('disconnect', () => socket.removeAllListeners())
  })

  /** Sending to clients */
  // Events
  emitter.on('eventAll', event => clientsNsp.emit('event', event))
  emitter.on('eventClients', (event, clients = []) =>
    clients.length && clients.reduce(
      (chain, client) => chain.to(client),
      clientsNsp
    ).emit('event', event))
  emitter.on('eventAdmin', event => adminNsp.emit('event', event))

  // Commands
  emitter.on('cmdAll', cmd => clientsNsp.emit('cmd', cmd))
  emitter.on('cmdClients', (cmd, clients) =>
    clients.length && clients.reduce(
      (chain, client) => chain.to(client),
      clientsNsp
    ).emit('cmd', cmd))
  emitter.on('cmdAdmin', cmd => adminNsp.emit('cmd', cmd))

  return server
}
