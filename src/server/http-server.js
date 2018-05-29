import express from 'express'
import path from 'path'
import http from 'http'
import sio from 'socket.io'

const app = express()
const httpServer = http.Server(app)
const io = sio(httpServer)

// Use sessions
const session = require('express-session')({
  secret: 'monstrous_secret',
  resave: true,
  saveUninitialized: true
})
const sharedSession = require('express-socket.io-session')
app.use(session)
io.of('/clients').use(sharedSession(session))

// We serve static from /assets. This allows games to easily include static assets by putting them in the /assets directory.
app.use(express.static('dist'))
app.use('/assets', express.static('assets'))

const hasPasswordMiddleware = password => (req, res, next) => {
  if (!password) { return next() }

  if (req.query.key === password) {
    return next()
  }

  res.redirect('/')
}

// Options are passed through to createServer inside of module
export default function createHttpServer ({
  port = 3000,
  clientPassword,
  adminPassword
}) {
  const clientMiddleware = hasPasswordMiddleware(clientPassword)
  const adminMiddleware = hasPasswordMiddleware(adminPassword)

  /* Routes */
  app.get('/admin', adminMiddleware, (req, res) => res.sendFile(path.join(__dirname, '../../index.html')))
  app.get('/', clientMiddleware, (req, res) => res.sendFile(path.join(__dirname, '../../index.html')))
  app.get('/fabric', (req, res) => res.sendFile(path.join(__dirname, '../../imports', 'fabric-2.2.3.js')))

  httpServer.listen(port, () => {
    console.log('listening on ' + port)
  })

  return {
    getIO () { return io }
  }
}
