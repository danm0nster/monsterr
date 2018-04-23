const express = require('express')
const app = express()
const path = require('path')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const monsterrServer = require('./monsterr-server')

// We serve static from /client. This allows games to easily include static assets by putting them in the /client directory.
app.use(express.static('dist'))
app.use('/assets', express.static('assets'))

/* Routes */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')))
app.get('/fabric', (req, res) => res.sendFile(path.join(__dirname, '../imports', 'fabric-2.2.3.js')))

// Options are passed through to createServer inside of module
module.exports = opts => monsterrServer(opts, io, (port = 3000) => {
  http.listen(port, () => {
    console.log('listening on ' + port)
  })
})
