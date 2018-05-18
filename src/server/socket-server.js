import { EventEmitter } from 'events'
import shortid from 'shortid'

class SocketServer extends EventEmitter {
  constructor (io) {
    super()

    this.clientsNsp = io.of('/clients')
    this.adminNsp = io.of('/admin')

    this.socketMap = {}
    this.latestHeartbeat = -1
    this.latencies = {}

    setInterval(() => {
      this.sendHeartbeat()
    }, 5000)

    this.setupClients()
    this.setupAdmin()
  }

  sendHeartbeat () {
    this.latestHeartbeat = Date.now()
    Object.entries(this.socketMap).forEach(([uuid, socket]) => {
      let latencies = this.latencies[uuid]
      let latest = latencies ? latencies.getLatest() : -1
      let avg = latencies ? latencies.getAvg() : -1
      socket.emit('_heartbeat', { latest, avg })
    })
  }

  handleHeartbeatAck (uuid) {
    let diff = Date.now() - this.latestHeartbeat
    let latencies = this.latencies[uuid]
    if (!latencies) {
      this.latencies[uuid] = {
        data: [diff],
        getLatest () {
          return this.data[this.data.length - 1]
        },
        getAvg () {
          return Math.round(this.data.reduce((sum, e) => sum + e, 0) / this.data.length)
        }
      }
    } else {
      latencies.data.push(diff)
      if (latencies.data.length >= 20) {
        latencies.data.shift()
      }
    }
  }

  setupClients () {
    this.clientsNsp.on('connection', socket => {
      // Get (or generate id)
      let uuid = socket.handshake.session.uuid
      if (!uuid) {
        socket.handshake.session.uuid = uuid = shortid()
        socket.handshake.session.save()
      }

      // new connection?
      if (!this.socketMap[uuid]) {
        this.emit('connect', uuid)
      } else {
        this.socketMap[uuid].disconnect() // disconnect prev socket
        this.emit('reconnect', uuid)
      }
      this.socketMap[uuid] = socket

      // internal events
      socket.emit('_id', uuid)
      socket.on('_heartbeat_ack', _ => {
        this.handleHeartbeatAck(uuid)
      })

      // Inbound
      const withClientId = cmdOrEvent => ({ ...cmdOrEvent, clientId: uuid })
      socket.on('cmd', cmd => this.emit('cmd', withClientId(cmd)))
      socket.on('event', event => this.emit('event', withClientId(event)))

      socket.on('disconnect', () => {
        socket.removeAllListeners()
        setTimeout(() => {
          // if still dc'ed, disconnect
          if (this.socketMap[uuid].id === socket.id) {
            delete this.socketMap[uuid]
            this.emit('disconnect', uuid)
          }
        }, 10000)
      })
    })
  }

  setupAdmin () {
    this.adminNsp.on('connection', socket => {
      socket.on('cmd', cmd => this.emit('cmd', cmd))
      socket.on('disconnect', () => socket.removeAllListeners())
    })
  }

  send (type = 'event', obj = {}) {
    return {
      toAll: () => this.clientsNsp.emit(type, obj),
      toClients: (clients = []) =>
        clients.length && clients
          .map(uuid => this.socketMap[uuid].emit(type, obj)),
      toAdmin: () => this.adminNsp.emit(type, obj)
    }
  }

  sendCommand (cmd) {
    return this.send('cmd', cmd)
  }
  sendEvent (event) {
    return this.send('event', event)
  }

  getLatencies () {
    return this.latencies
  }
}

export default function createSocketServer (io) {
  return new SocketServer(io)
}
